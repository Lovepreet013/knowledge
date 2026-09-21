import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { Auth0Provider } from '@auth0/auth0-react'
import { getAuth0Config } from './features/auth/auth0-config.ts'

const auth0 = getAuth0Config()

// Don't mount the Auth0 provider without a domain/client ID — Auth0Button
// renders a fallback notice instead until the VITE_AUTH0_* vars are set
// (then restart dev).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {auth0 ? (
      <Auth0Provider
        domain={auth0.domain}
        clientId={auth0.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          scope: 'openid profile email',
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
)
