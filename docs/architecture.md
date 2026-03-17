# Architecture

## Arquitectura real (as-is)
Arquitectura **frontend-heavy**, orientada a cliente:

- **Presentación**: páginas App Router + componentes React.
- **Estado de aplicación**: `OpportunitiesProvider` en layout de dashboard.
- **Dominio/selección**: helpers puros en `lib/selectors` y constantes en `lib/constants`.
- **Persistencia**: patrón repositorio (`OpportunitiesRepository`) con implementación en memoria o Supabase REST.
- **Auth**: utilidades custom con endpoints de Supabase Auth y storage local.

## Capas del sistema

### 1) Routing/Layout (App Router)
- `app/layout.tsx`: layout raíz y metadatos.
- `app/page.tsx`: redirección a `/dashboard`.
- `app/(dashboard)/layout.tsx`: aplica `AuthGate`, `OpportunitiesProvider` y `AppShell`.

### 2) UI/Feature layer
- Páginas de dashboard: dashboard, oportunidades (list/new/edit/detail), pipeline.
- Componentes de dominio: `OpportunityCard`, `PipelineBoard`, `StatusBadge`, etc.

### 3) Estado y orquestación
- `OpportunitiesProvider` mantiene `opportunities`, `activities`, `isLoading`, `error`.
- Expone comandos async: create/update/delete/status/refresh.

### 4) Datos
- Contrato: `OpportunitiesRepository`.
- Implementaciones:
  - `InMemoryOpportunitiesRepository` (mock seed).
  - `SupabaseOpportunitiesRepository` (REST directa).
- Fábrica con selección por env y fallback automático.

### 5) Infraestructura Auth/Supabase
- `lib/supabase/auth.ts`: login/logout OAuth y parseo de hash.
- `lib/supabase/session-storage.ts`: persistencia de sesión en `localStorage`.
- `lib/supabase/client.ts`: configuración y helper genérico `supabaseRestFetch`.

## Dependencias entre módulos
- `app/(dashboard)/layout.tsx` depende de auth gate + provider.
- Las páginas consumen `useOpportunities()` y selectores puros.
- El provider depende solo de `getOpportunitiesRepository()`.
- El repositorio Supabase depende de `supabaseRestFetch` y del contrato de tablas.

## Riesgos arquitectónicos
- Seguridad y autorización descansan en RLS + token cliente, sin middleware server.
- Singleton de repositorio y estado global en cliente dificulta SSR y pruebas E2E aisladas.
- Capa `lib/services/opportunities.ts` existe pero no se utiliza en runtime (deuda de arquitectura).
