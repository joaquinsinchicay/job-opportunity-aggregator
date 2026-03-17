# System Overview

## Propósito de la aplicación
`job-opportunity-aggregator` es una aplicación web para gestionar una búsqueda laboral personal: registrar oportunidades, moverlas por estados de pipeline, ver métricas y consultar historial de actividad.

## Problema que resuelve
Centraliza en una sola UI el seguimiento del proceso de postulación (saved/applied/interview/offer/rejected), evitando llevar información dispersa en notas o planillas.

## Componentes principales
- **Next.js App Router** como shell de rutas y layouts (`app/`).
- **Capa de UI** con componentes reutilizables (`components/`) y páginas cliente para interacción.
- **Estado de dominio en cliente** con `OpportunitiesProvider` (`lib/contexts/opportunities-context.tsx`).
- **Repositorio de datos** con dos implementaciones: memoria y Supabase (`lib/repositories/*`).
- **Integración Auth + REST con Supabase** sin SDK oficial, vía `fetch` y tokens en `localStorage` (`lib/supabase/*`).

## Flujo general (login → uso → persistencia)
1. Usuario entra por `/login` o `/signup`.
2. Al iniciar con Google, se redirige a Supabase Auth y vuelve con tokens en `#hash`.
3. `consumeOAuthSessionFromUrlHash` persiste sesión en `localStorage`.
4. Al navegar al dashboard, `AuthGate` permite o redirige a login.
5. `OpportunitiesProvider` instancia repositorio y carga oportunidades + actividades.
6. Cada acción de UI (crear/editar/cambiar estado/eliminar) llama métodos del repositorio.
7. Si el repositorio activo es Supabase, se ejecutan llamadas REST directas a tablas (`opportunities`, `activities`, `followups`).
8. El estado local del provider se sincroniza con el resultado de esas operaciones y actualiza la UI.

## Limitaciones observadas de alto nivel
- Lógica de autenticación y sesión 100% cliente (sin protección server-side).
- Ausencia de capa API intermedia: el frontend llama Supabase REST directamente.
- Manejo de errores parcial en formularios y operaciones críticas.
