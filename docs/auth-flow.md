# Auth Flow

## Flujo de autenticación actual
1. Usuario pulsa “Continue with Google” en `/login` o `/signup`.
2. `signInWithGoogleOAuth` redirige a `auth/v1/authorize?provider=google`.
3. Supabase redirige de vuelta al path original con tokens en hash (`#access_token=...`).
4. `consumeOAuthSessionFromUrlHash` parsea hash, guarda tokens y limpia URL.
5. Si hay token válido en storage, login/signup redirigen a `/dashboard`.
6. En dashboard, `AuthGate` revisa token y redirige a `/login` si falta.

## Manejo de sesión
- Tokens guardados en `localStorage`.
- `getAccessToken()` invalida sesión si expiró `expiresAt`.
- Logout llama `auth/v1/logout` (si hay token) y luego limpia storage.

## Asociación de datos al usuario
- Se delega a Supabase mediante:
  - default `user_id = auth.uid()` en `opportunities`.
  - políticas RLS por usuario y por relación de tablas hijas.

## Hallazgos
- Protección de rutas solo del lado cliente (`AuthGate`), sin chequeo server-side previo al render.
- No hay refresco de sesión con `refresh_token` aunque se almacena.
- Potencial inconsistencia entre helpers de token (`getAccessToken` vs lectura directa de localStorage en cliente REST).
