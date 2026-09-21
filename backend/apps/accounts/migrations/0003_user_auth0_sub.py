# Generated for Auth0 login (User.auth0_sub)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_google_sub'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='auth0_sub',
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True, unique=True),
        ),
    ]
