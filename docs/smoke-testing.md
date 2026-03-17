# Smoke Testing

## Objetivo de la suite
Contar con una suite E2E pequeña y rápida para validar estabilidad operativa después de cambios o deploys, enfocada en los flujos críticos de autenticación, protección de rutas, dashboard, CRUD de oportunidades, pipeline y logout.

## Alcance
La suite está implementada con Playwright y se ejecuta en Chromium contra la app levantada con `next dev`.

- Directorio de tests: `tests/smoke/`
- Configuración: `playwright.config.ts`
- Repositorio de oportunidades forzado por defecto a `memory` durante smoke (`NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND=memory`) para estabilidad y aislamiento.

## Flujos cubiertos

### Authentication
- Login con email/password (condicional según variables de entorno).
- Presencia del entrypoint de Google Auth (botón visible).

### Route protection
- Usuario sin sesión es redirigido a `/login` desde ruta protegida.
- Luego de logout, no se puede volver a rutas protegidas.

### Dashboard
- Acceso al dashboard con sesión autenticada.
- Verificación básica de render (heading y acción principal).

### Opportunities
- Crear oportunidad.
- Ver oportunidad en listado.
- Ver detalle.
- Editar oportunidad.
- Eliminar oportunidad.

### Pipeline
- Cambio de estado a `Interview`.
- Verificación de persistencia del estado en la vista de pipeline.

### Logout
- Cierre de sesión desde sidebar.
- Redirección a `/login`.

## Flujos excluidos o parciales
- **Google OAuth E2E completo**: no se automatiza el callback real contra Google por su naturaleza cross-domain + proveedor externo (fragilidad elevada en smoke). Se cubre presencia del botón y se deja validación manual guiada.

## Variables de entorno necesarias

### Mínimas para ejecutar la suite base
No requiere variables de Supabase para los tests con sesión sembrada en localStorage.

### Para habilitar test de login email/password real
Definir:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SMOKE_TEST_EMAIL`
- `SMOKE_TEST_PASSWORD`

Si faltan, el test de login password se marca como `skip` automáticamente.

## Data setup recomendada
- Usuario de pruebas dedicado en Supabase para `SMOKE_TEST_EMAIL`.
- Password estable de ese usuario (`SMOKE_TEST_PASSWORD`).
- No se requiere seed manual de oportunidades para los tests de CRUD: cada test crea sus propios datos.

## Scripts
- `npm run test:smoke`
- `npm run test:smoke:headed`
- `npm run test:smoke:debug`

## Criterios de éxito/fallo

### Éxito
- Todos los tests no omitidos pasan.
- Los tests omitidos corresponden únicamente a precondiciones ausentes (por ejemplo credenciales de Supabase).

### Fallo
- Cualquier flujo crítico no omitido falla (redirecciones rotas, CRUD no funcional, estado no persistido, logout inefectivo).

## Ejecución local
1. Instalar dependencias del proyecto.
2. (Opcional) configurar variables para login real.
3. Ejecutar:

```bash
npm run test:smoke
```

## Consideraciones especiales
- La suite prioriza **estabilidad** sobre exhaustividad de edge cases.
- Se usan selectores semánticos (`getByRole`, `getByLabel`) para reducir fragilidad.
- Se ejecuta en un solo worker para evitar interferencias de estado.

## Mantenimiento esperado
- Actualizar selectores solo cuando cambie semántica UI real.
- Mantener tests pequeños y orientados a “servicio vivo”.
- Documentar nuevas limitaciones en `docs/known-issues.md` y deudas en `docs/technical-debt.md`.

## Validación manual sugerida (Google Auth)
1. Ir a `/login`.
2. Click en **Continue with Google**.
3. Confirmar redirección al proveedor.
4. Completar login y validar retorno a `/dashboard`.
5. Confirmar sesión activa y navegación a rutas protegidas.
