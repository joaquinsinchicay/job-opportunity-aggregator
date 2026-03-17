# AGENTS.md

## Propósito del proyecto
Aplicación web para gestionar oportunidades laborales personales con autenticación Supabase, pipeline por estados y seguimiento de actividad.

## Principios de arquitectura
1. **Respetar el patrón repositorio** (`OpportunitiesRepository`) para toda persistencia.
2. **Separar UI de lógica de dominio**: usar selectores/helpers en `lib/*`.
3. **No acoplar vistas a Supabase directamente** fuera de `lib/supabase` y `lib/repositories`.
4. **Mantener paridad funcional** entre repositorio en memoria y repositorio Supabase.
5. **Priorizar compatibilidad con App Router** y mínima sorpresa en navegación.

## Reglas de intervención para agentes
1. No introducir nuevas funcionalidades sin requerimiento explícito.
2. No hacer refactors masivos sin plan aprobado.
3. Antes de editar, revisar impacto en:
   - autenticación
   - ownership de datos
   - contrato `Opportunity` / `ActivityItem`
4. Si cambias persistencia, validar implicancias de RLS y políticas de acceso.
5. No romper rutas ni contratos de props existentes sin migración controlada.

## Buenas prácticas para debugging
- Reproducir errores primero con pasos explícitos.
- Validar tanto modo memoria como Supabase cuando aplique.
- Verificar errores de red/autorización en operaciones CRUD.
- Confirmar consistencia UI ↔ DB después de create/update/delete/status.
- Documentar hallazgos en `docs/known-issues.md` y `docs/technical-debt.md`.

## Convenciones de documentación
- Toda decisión técnica relevante debe registrarse en `/docs`.
- Evitar documentación aspiracional: describir arquitectura real (“as-is”) y brechas.
- Incluir siempre:
  - impacto
  - causa raíz
  - archivos involucrados
  - recomendación concreta

## Prioridades técnicas
- **P0 (crítico):** seguridad de acceso, integridad de datos, errores de build/tipado.
- **P1 (alto):** consistencia de dominio entre repositorios, manejo robusto de errores.
- **P2 (medio):** mejoras de arquitectura y protección de rutas server-side.
- **P3 (mejora):** observabilidad, DX, limpieza incremental de deuda.

## Restricciones importantes
Desalentar explícitamente:
- cambios innecesarios o cosméticos sin impacto técnico,
- refactors amplios no justificados,
- ruptura de contratos existentes,
- modificación de UX sin causa técnica validada,
- cambios que alteren comportamiento sin pruebas y documentación.
