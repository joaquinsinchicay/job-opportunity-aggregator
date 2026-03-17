# Technical Debt

## Deuda de arquitectura
1. **Capa de servicios no usada en runtime** (`lib/services/opportunities.ts`): aumenta superficie sin beneficio actual.
2. **App muy client-side**: limita SSR/cache y endurece protección de rutas.
3. **Acoplamiento fuerte UI ↔ repositorio global singleton**: complica tests aislados y multi-contexto.

## Deuda de calidad
1. **Configuración permisiva de build/TS** (`allowJs: true`, `ignoreBuildErrors: true`).
2. **Manejo de errores CRUD parcialmente unificado**: se normalizó el flujo de escritura en el provider con toast + logging, pero la carga inicial aún no usa el mismo surface de feedback.
3. **Validaciones duplicadas** entre formularios new/edit.
4. **Falta de observabilidad** (sin logging estructurado ni telemetría de fallos funcionales).

## Deuda de seguridad
1. **Sesión y autorización delegadas al cliente**, sin validación server-side previa.
2. **Refresh token almacenado pero sin uso efectivo**.
3. **Dependencia total de RLS correcta en Supabase** para aislamiento multiusuario.

## Deuda de testing automatizado
1. **Dependencia externa para tooling E2E (`@playwright/test`)**: requiere política de red compatible para instalar y ejecutar smoke tests en todos los entornos.
