from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from .models import User
from .serializers import (
    Auth0AuthSerializer,
    GoogleAuthSerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


# Create your views here.
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


def _unique_username_from_email(email: str) -> str:
    """Derive a unique Django username from an email address.

    Keeps only validator-allowed chars, truncates to 150, appends a
    numeric suffix on collision.
    """
    import re

    base = (email.split("@")[0] or "user").strip().lower()
    base = re.sub(r"[^\w.@+-]", "", base) or "user"
    base = base[:150]
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        suffix = str(counter)
        username = f"{base[: 150 - len(suffix)]}{suffix}"
        counter += 1
    return username


def _tokens_for_user(user):
    """Mint our own JWT pair for a verified social user."""
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
    )


def _resolve_social_user(
    *,
    sub_value,
    sub_field,
    email,
    first_name,
    last_name,
    invite_code,
    email_noun,
    account_noun,
):
    """Shared find/link/create for verified social ID-token logins.

    - Known `sub`   -> login (invite ignored, company/role untouched).
    - Known email   -> link `sub`, login (company/role untouched).
    - Unknown email -> require invite_code, create (company, role=user).
    Returns (user, None) on success, (None, error Response) on failure.
    """
    user = User.objects.filter(**{sub_field: sub_value}).first()
    if user is not None:
        if not user.is_active:
            return None, Response(
                {"detail": "This account is deactivated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated = False
        if not user.first_name and first_name:
            user.first_name = first_name
            updated = True
        if not user.last_name and last_name:
            user.last_name = last_name
            updated = True
        if updated:
            user.save(update_fields=["first_name", "last_name"])
        return user, None

    existing = User.objects.filter(email__iexact=email).order_by("id").first()
    if existing is not None:
        if getattr(existing, sub_field) and getattr(existing, sub_field) != sub_value:
            return None, Response(
                {"detail": f"This {account_noun} is already linked to another user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not existing.is_active:
            return None, Response(
                {"detail": "This account is deactivated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        linked = False
        if not getattr(existing, sub_field):
            setattr(existing, sub_field, sub_value)
            linked = True
        if not existing.first_name and first_name:
            existing.first_name = first_name
            linked = True
        if not existing.last_name and last_name:
            existing.last_name = last_name
            linked = True
        if linked:
            existing.save()
        return existing, None

    if not invite_code:
        return None, Response(
            {
                "detail": f"No account found for this {email_noun}. "
                "Please register with an invite code first."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    from apps.companies.models import Company

    try:
        company = Company.objects.get(invite_code=invite_code, is_active=True)
    except Company.DoesNotExist:
        return None, Response(
            {"invite_code": ["Invalid invite code."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User(
        username=_unique_username_from_email(email),
        email=email,
        first_name=first_name,
        last_name=last_name,
        company=company,
        role="user",
        **{sub_field: sub_value},
    )
    user.set_unusable_password()
    user.save()
    return user, None


_auth0_jwks_client = None


def _verify_auth0_id_token(token):
    """Verify an Auth0 ID token (RS256) against the tenant JWKS.

    Returns (idinfo dict, None) on success, (None, error Response) on failure.
    """
    domain = (getattr(settings, "AUTH0_DOMAIN", "") or "").strip()
    audience = (getattr(settings, "AUTH0_AUDIENCE", "") or "").strip()
    if not domain or not audience:
        return None, Response(
            {"detail": "Social sign-in is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        import jwt
        from jwt import PyJWKClient

        global _auth0_jwks_client
        if _auth0_jwks_client is None:
            _auth0_jwks_client = PyJWKClient(
                f"https://{domain}/.well-known/jwks.json", cache_keys=True
            )
        signing_key = _auth0_jwks_client.get_signing_key_from_jwt(token)
        idinfo = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            issuer=f"https://{domain}/",
            # Tolerate normal clock skew: this machine may run seconds
            # behind the Auth0 servers, making fresh tokens look not-yet-valid.
            leeway=30,
        )
    except Exception as exc:
        from jwt import exceptions as jwt_exceptions

        # Specific, actionable messages (safe: they name the failed check,
        # never token contents). The full traceback stays server-side.
        if isinstance(exc, jwt_exceptions.ExpiredSignatureError):
            detail = "Session expired. Please sign in again."
        elif isinstance(exc, jwt_exceptions.ImmatureSignatureError):
            detail = (
                "Sign-in token is not yet valid (clock skew). Check this "
                "machine's clock is correct, then retry."
            )
        elif isinstance(exc, jwt_exceptions.InvalidAudienceError):
            detail = (
                "Sign-in token was issued for a different application "
                "(audience mismatch). Make sure backend AUTH0_AUDIENCE equals "
                "the Auth0 Application Client ID."
            )
        elif isinstance(exc, jwt_exceptions.InvalidIssuerError):
            detail = (
                "Sign-in token issuer mismatch. "
                "Make sure backend AUTH0_DOMAIN is your Auth0 tenant domain."
            )
        elif isinstance(exc, jwt_exceptions.PyJWKClientError):
            detail = (
                "Could not verify the sign-in token signature. Check "
                "AUTH0_DOMAIN and that the Auth0 app uses RS256 signing."
            )
        else:
            detail = "Invalid sign-in token."
        logger.warning(
            "Auth0 ID-token verification failed (%s): %s",
            type(exc).__name__,
            str(exc)[:300],
        )
        return None, Response(
            {"detail": detail},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Email is our link key, so only verified emails may link/create accounts.
    if not idinfo.get("email_verified", False):
        return None, Response(
            {"detail": "Your email address is not verified."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return idinfo, None


class Auth0LoginView(APIView):
    """Verify an Auth0 ID token and return our own JWT pair.

    POST /api/auth/auth0/ {id_token, invite_code?}
    - Existing auth0_sub -> login (invite ignored).
    - Existing email     -> link auth0_sub, login (company/role untouched).
    - New email          -> require invite_code, create user(company, role=user).
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = Auth0AuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["id_token"]
        invite_code = (serializer.validated_data.get("invite_code") or "").strip()

        idinfo, error = _verify_auth0_id_token(token)
        if error is not None:
            return error

        auth0_sub = idinfo.get("sub", "")
        email = (idinfo.get("email") or "").strip().lower()
        if not auth0_sub or not email:
            return Response(
                {"detail": "Social sign-in could not be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        first_name = (idinfo.get("given_name") or "")[:150]
        last_name = (idinfo.get("family_name") or "")[:150]
        if not first_name and idinfo.get("name"):
            # Some connections only send a display name — split it once.
            parts = str(idinfo["name"]).strip().split()
            if parts:
                first_name = parts[0][:150]
                last_name = " ".join(parts[1:])[:150]

        user, error = _resolve_social_user(
            sub_value=auth0_sub,
            sub_field="auth0_sub",
            email=email,
            first_name=first_name,
            last_name=last_name,
            invite_code=invite_code,
            email_noun="email",
            account_noun="social account",
        )
        if error is not None:
            return error
        return _tokens_for_user(user)


class GoogleLoginView(APIView):
    """Verify a Google ID token and return our own JWT pair.

    POST /api/auth/google/ {id_token, invite_code?}
    - Existing google_sub  -> login (invite ignored).
    - Existing email       -> link google_sub, login (company/role untouched).
    - New email            -> require invite_code, create user(company, role=user).
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["id_token"]
        invite_code = (serializer.validated_data.get("invite_code") or "").strip()

        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        if not client_id:
            return Response(
                {"detail": "Google sign-in is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token as google_id_token

            idinfo = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), client_id
            )
        except ValueError:
            return Response(
                {"detail": "Invalid Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                {"detail": "Google authentication could not be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        issuer = idinfo.get("iss", "")
        if issuer not in ("accounts.google.com", "https://accounts.google.com"):
            return Response(
                {"detail": "Invalid Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not idinfo.get("email_verified", False):
            return Response(
                {"detail": "Your Google account email address is not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_sub = idinfo.get("sub", "")
        email = (idinfo.get("email") or "").strip().lower()
        if not google_sub or not email:
            return Response(
                {"detail": "Google authentication could not be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        first_name = (idinfo.get("given_name") or "")[:150]
        last_name = (idinfo.get("family_name") or "")[:150]

        # 1. Returning Google user — stable `sub` lookup, never email.
        user = User.objects.filter(google_sub=google_sub).first()
        if user is not None:
            if not user.is_active:
                return Response(
                    {"detail": "This account is deactivated."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save(update_fields=["first_name", "last_name"])
            return self._tokens_for(user)

        # 2. Link-by-email: password user with the same verified Google email.
        existing = (
            User.objects.filter(email__iexact=email).order_by("id").first()
        )
        if existing is not None:
            if existing.google_sub and existing.google_sub != google_sub:
                return Response(
                    {
                        "detail": "This Google account is already linked to another user."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not existing.is_active:
                return Response(
                    {"detail": "This account is deactivated."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            linked = False
            if not existing.google_sub:
                existing.google_sub = google_sub
                linked = True
            if not existing.first_name and first_name:
                existing.first_name = first_name
                linked = True
            if not existing.last_name and last_name:
                existing.last_name = last_name
                linked = True
            if linked:
                existing.save()
            return self._tokens_for(existing)

        # 3. Brand-new user — invite code is mandatory for tenant assignment.
        # Login never sends one (register does), so a missing code here means
        # "no account for this Google email" — direct them to register.
        if not invite_code:
            return Response(
                {
                    "detail": "No account found for this Google email. "
                    "Please register with an invite code first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        from apps.companies.models import Company

        try:
            company = Company.objects.get(invite_code=invite_code, is_active=True)
        except Company.DoesNotExist:
            return Response(
                {"invite_code": ["Invalid invite code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User(
            username=_unique_username_from_email(email),
            email=email,
            first_name=first_name,
            last_name=last_name,
            company=company,
            role="user",
            google_sub=google_sub,
        )
        user.set_unusable_password()
        user.save()
        return self._tokens_for(user)

    def _tokens_for(self, user):
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )
