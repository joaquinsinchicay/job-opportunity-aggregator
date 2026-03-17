# Roadmap Técnico Priorizado

## P0 — Crítico

### 1) Endurecer control de tipos en CI/build
- **Severidad:** P0
- **Impacto:** evita despliegues con errores de tipado.
- **Causa raíz:** `ignoreBuildErrors` habilitado.
- **Archivos:** `next.config.mjs`, `tsconfig.json`, pipeline CI.
- **Recomendación:** desactivar `ignoreBuildErrors`; agregar `tsc --noEmit` obligatorio.

### 2) Corregir uso de token en `supabaseRestFetch`
- **Severidad:** P0
- **Impacto:** reduce errores 401 silenciosos por sesión vencida.
- **Causa raíz:** lectura directa de token sin validar expiración.
- **Archivos:** `lib/supabase/client.ts`, `lib/supabase/session-storage.ts`.
- **Recomendación:** usar `getAccessToken()` como única fuente de verdad.

## P1 — Alto

### 3) Unificar manejo de errores y estados de submit
- **Severidad:** P1
- **Impacto:** mejora robustez UX en formularios críticos.
- **Causa raíz:** falta de `try/finally` + surface de error consistente.
- **Archivos:** `app/(dashboard)/opportunities/new/page.tsx`, `app/(dashboard)/opportunities/[id]/edit/page.tsx`, `lib/contexts/opportunities-context.tsx`.
- **Recomendación:** patrón estándar para async UI con finally + mensajes de error.

### 4) Cerrar brecha de fecha aplicada entre repositorios
- **Severidad:** P1
- **Impacto:** evita inconsistencias entre ambientes.
- **Causa raíz:** lógica de dominio diferente en memoria vs Supabase.
- **Archivos:** `lib/repositories/opportunities-repository.ts`, `lib/repositories/supabase-opportunities-repository.ts`.
- **Recomendación:** definir contrato explícito y tests de paridad.

## P2 — Medio

### 5) Reducir deuda de arquitectura no usada (`services`)
- **Severidad:** P2
- **Impacto:** menor confusión para futuros mantenedores/agentes.
- **Causa raíz:** evolución parcial de capas.
- **Archivos:** `lib/services/opportunities.ts`, consumidores potenciales.
- **Recomendación:** o integrar formalmente la capa o deprecarla explícitamente.

### 6) Mejorar protección de rutas (SSR/middleware)
- **Severidad:** P2
- **Impacto:** reduce flash de contenido y side effects prematuros.
- **Causa raíz:** auth gate solo cliente.
- **Archivos:** `components/auth/auth-gate.tsx`, rutas `app/(dashboard)/*`.
- **Recomendación:** introducir chequeo server-side compatible con App Router.

## P3 — Mejora

### 7) Documentar y normalizar constraints de esquema Supabase
- **Severidad:** P3
- **Impacto:** reduce errores de migración y upserts frágiles.
- **Causa raíz:** inferencia implícita de índices/constraints.
- **Archivos:** `supabase/migrations/*`, docs de datos.
- **Recomendación:** añadir migraciones explícitas para unique keys necesarias (`followups.opportunity_id`).

### 8) Consolidar observabilidad técnica
- **Severidad:** P3
- **Impacto:** acelera diagnóstico de incidentes.
- **Causa raíz:** falta de métricas y tracing funcional.
- **Archivos:** auth, repositorios, provider.
- **Recomendación:** logging estructurado y eventos de error por caso de uso.
