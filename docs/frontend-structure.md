# Frontend Structure

## Estructura de carpetas (frontend)
- `app/`: rutas y layouts App Router.
- `components/`: UI reusable (incluye `components/ui` de shadcn).
- `lib/contexts`: provider principal de oportunidades.
- `lib/selectors`: transformaciones y filtros puros.
- `lib/constants`, `lib/types`, `lib/date-utils`: utilidades de dominio.

## Entrypoints
- `/` → redirige a `/dashboard`.
- `/login`, `/signup` para auth.
- Rutas protegidas en `/(dashboard)`: dashboard, opportunities, pipeline.

## Navegación
- Sidebar (`AppSidebar`) con enlaces a dashboard/opportunities/pipeline.
- Navegación secundaria desde cards y páginas de detalle/edición.

## Estado
- Estado global cliente con Context API (`OpportunitiesProvider`).
- Derivados con `useMemo` + selectores (stats, filtros, follow-ups).
- No existe store externo (Redux/Zustand) ni cache server-state dedicada.

## Reutilización y duplicación
### Reutilización correcta
- Badges de estado/work mode.
- Cards y EmptyState.
- Selectores de filtrado y estadísticas.

### Duplicaciones detectadas
- Validación de formulario (campos requeridos y URL) repetida en `new` y `edit`.
- Manejo de `isSubmitting` repetido y frágil por falta de `try/finally`.

## Manejo de errores UI
- Login/signup muestran error para OAuth.
- En CRUD de escritura de oportunidades (create/update/delete/update status) se unificó feedback con toast destructivo + logging técnico desde `OpportunitiesProvider`.
- Operaciones async en páginas pueden fallar dejando UI en estado incoherente (ej. submit bloqueado).

## Side effects riesgosos
- Redirect de auth se ejecuta en `useEffect` (después de render), provocando posible flash de contenido.
- Llamadas de red directas desde cliente a Supabase REST en cada operación de dominio.
