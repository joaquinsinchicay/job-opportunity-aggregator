# Known Issues

## Bugs confirmados

### 1) `isSubmitting` puede quedar bloqueado en formularios new/edit
- **Tipo:** confirmado por evidencia.
- **Qué pasa:** si `addOpportunity` o `updateOpportunity` lanza error, `setIsSubmitting(false)` no se ejecuta.
- **Impacto:** botón queda en “Saving...” y UX bloqueada hasta recargar.
- **Archivos:**
  - `app/(dashboard)/opportunities/new/page.tsx`
  - `app/(dashboard)/opportunities/[id]/edit/page.tsx`
- **Reproducción:** provocar fallo de red/Supabase durante submit.

### 2) `supabaseRestFetch` usa token potencialmente expirado
- **Tipo:** confirmado por evidencia.
- **Qué pasa:** helper de cliente lee `supabase.access_token` directo de localStorage y no valida expiración.
- **Impacto:** llamadas REST pueden salir con token vencido y fallar en cadena.
- **Archivo:** `lib/supabase/client.ts`.

### 3) Build puede “pasar” con errores de TypeScript
- **Tipo:** confirmado por evidencia de configuración.
- **Qué pasa:** `next.config.mjs` tiene `typescript.ignoreBuildErrors = true`.
- **Impacto:** riesgo de desplegar fallos de tipado y runtime bugs.
- **Archivo:** `next.config.mjs`.

## Bugs altamente probables

### 4) Protección de rutas vulnerable a flash/render inicial
- **Tipo:** altamente probable.
- **Qué pasa:** `AuthGate` redirige en `useEffect`, después del primer render de children.
- **Impacto:** render fugaz de contenido protegido y ejecución temprana de side effects.
- **Archivo:** `components/auth/auth-gate.tsx`.

### 5) Divergencia de fecha aplicada entre repositorio memoria y Supabase
- **Tipo:** altamente probable.
- **Qué pasa:** en memoria, pasar a `applied` setea `appliedDate`; en Supabase solo actualiza `status`.
- **Impacto:** inconsistencia UI/DB dependiendo del backend activo.
- **Archivos:**
  - `lib/repositories/opportunities-repository.ts`
  - `lib/repositories/supabase-opportunities-repository.ts`

## Hipótesis que requieren validación

### 6) Inserción en `followups` podría depender de constraint único no documentado
- **Tipo:** hipótesis.
- **Qué pasa:** upsert usa `on_conflict=opportunity_id`; si no existe índice/constraint único, puede fallar.
- **Impacto:** seguimiento no persistido al editar follow-up.
- **Archivo:** `lib/repositories/supabase-opportunities-repository.ts`.
