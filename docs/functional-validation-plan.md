# Functional Validation Plan

## Overview
Este documento define un plan de verificación funcional end-to-end para `job-opportunity-aggregator`, alineado con la arquitectura real documentada (App Router + `OpportunitiesProvider` + patrón repositorio + Supabase REST + Auth OAuth en cliente).

Objetivos:
- Verificar que los flujos funcionales críticos funcionen de punta a punta en modo **Supabase** (principal) y validar paridad mínima en modo **memory** cuando aplique.
- Definir criterios de aceptación **claros, observables y comprobables** por feature.
- Cubrir validaciones de UI, persistencia, ownership/permisos y manejo de errores.
- Identificar brechas de definición o comportamiento parcialmente implementado.

## Scope

### Incluido
- Autenticación con Google (login/signup).
- Manejo de sesión (persistencia, expiración, logout, recuperación al refresh).
- Protección de rutas cliente (`AuthGate`) en área dashboard.
- Dashboard y widgets (stats, recent opportunities, follow-ups).
- CRUD de oportunidades:
  - listado y filtros,
  - alta,
  - edición,
  - borrado,
  - detalle.
- Cambio de estado y sincronización con pipeline.
- Acción “Add to pipeline”.
- Pipeline drag & drop.
- Timeline/actividades en detalle (si corresponde por flujo).
- Persistencia en Supabase y visibilidad por usuario (RLS/ownership).
- Manejo de errores (auth, CRUD, carga inicial).
- Recarga de datos al refrescar navegador.

### Fuera de alcance en esta etapa
- Refactors de arquitectura.
- Nuevas funcionalidades de negocio.
- Cambios de UX no motivados por bugs o criterios de aceptación.

### Ambientes de prueba sugeridos
- **E2E principal:** `NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND=supabase`.
- **Regresión funcional rápida:** `NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND=memory`.
- Navegadores: Chromium (mínimo), idealmente 1 navegador adicional.

## Critical User Flows

### Flujos críticos de negocio (P0)
1. OAuth Google login/signup → acceso a dashboard con sesión válida.
2. Usuario autenticado crea oportunidad y la ve sin recargar.
3. Usuario cambia estado (detalle/listado/pipeline) y se refleja en UI + DB.
4. Usuario mueve card por drag & drop en pipeline y persiste status.
5. Usuario no puede acceder a oportunidades de otro usuario.
6. Eliminación de oportunidad elimina trazas relacionadas y no deja residuos visibles.

### Flujos secundarios (P1/P2)
1. Filtros y búsqueda en listado.
2. Edición de oportunidad y consistencia con detalle.
3. Dashboard (stats/recent/follow-up) consistente tras mutaciones.
4. Timeline de actividades coherente con eventos creados por sistema.

### Validaciones técnicas complementarias
1. Paridad funcional memory vs Supabase para reglas de dominio clave.
2. Token/session lifecycle: expiración, refresh implícito vía REST helper y logout.
3. Manejo de errores de red/401/500 sin dejar UI bloqueada.
4. Estado tras refresh de página en rutas internas.

## Functional Validation Matrix

> Nota: cada caso debe ejecutarse al menos en Supabase. Donde aplique paridad, repetir en memory.

### F01 — Login con Google
- **Objetivo funcional:** permitir autenticación mediante OAuth Google y redirigir al dashboard.
- **Precondiciones:** usuario no autenticado; configuración Supabase válida.
- **Criterios de aceptación:**
  - Al pulsar “Continue with Google”, el usuario es redirigido al proveedor OAuth.
  - Al volver con hash válido, la sesión se guarda y se limpia el hash de URL.
  - Tras consumir sesión válida, el usuario termina en `/dashboard`.
- **Caso feliz:** login desde `/login` con cuenta válida.
- **Casos alternativos:** login desde `/signup`; usuario ya autenticado entra en `/login` o `/signup` y es redirigido a `/dashboard`.
- **Edge cases:** hash incompleto sin `access_token`; `error_description` en hash OAuth.
- **Validaciones visuales/UI:** botón pasa a estado “Redirecting…”; error visible en rojo si falla OAuth.
- **Validaciones de persistencia DB:** no aplica en tablas de dominio; validar sesión en storage cliente.
- **Validaciones de permisos/ownership:** acceso a dashboard sólo con sesión activa.
- **Validaciones de manejo de error:** mensaje explícito y recuperable en login/signup.
- **Prioridad:** P0.

### F02 — Manejo de sesión (persistencia, expiración, logout)
- **Objetivo funcional:** mantener sesión válida, invalidar sesión vencida y cerrar sesión correctamente.
- **Precondiciones:** usuario autenticado al menos una vez.
- **Criterios de aceptación:**
  - Al refrescar, si token no expiró, el usuario conserva acceso.
  - Si sesión expira, se invalida acceso y se requiere login.
  - Al hacer logout, se limpian tokens y se redirige a `/login`.
- **Caso feliz:** sesión válida sobrevive refresh y navegación interna.
- **Casos alternativos:** token expirado con refresh token válido (helper REST obtiene token nuevo).
- **Edge cases:** refresh token inválido provoca limpieza de sesión y siguientes requests fallan autenticado.
- **Validaciones visuales/UI:** logout vuelve a pantalla login sin residuos de datos.
- **Validaciones de persistencia DB:** no altera datos de dominio.
- **Validaciones de permisos/ownership:** sin token válido, rutas protegidas deben rechazar acceso.
- **Validaciones de manejo de error:** ante expiración, feedback y/o redirección consistente, sin loop infinito.
- **Prioridad:** P0.

### F03 — Protección de rutas
- **Objetivo funcional:** impedir acceso a `/(dashboard)` sin sesión.
- **Precondiciones:** ruta protegida conocida (`/dashboard`, `/opportunities`, `/pipeline`).
- **Criterios de aceptación:**
  - Usuario no autenticado es redirigido a `/login`.
  - Usuario autenticado puede navegar entre rutas protegidas.
- **Caso feliz:** entrar directo a `/dashboard` autenticado.
- **Casos alternativos:** entrar directo no autenticado a `/opportunities/:id`.
- **Edge cases:** flash de contenido protegido antes de redirección (debe medirse y reportarse si ocurre).
- **Validaciones visuales/UI:** ausencia de contenido sensible visible para usuario no autenticado.
- **Validaciones de persistencia DB:** no aplica.
- **Validaciones de permisos/ownership:** no autenticado no debe ejecutar acciones de mutación.
- **Validaciones de manejo de error:** redirección estable sin errores de render.
- **Prioridad:** P0.

### F04 — Dashboard
- **Objetivo funcional:** mostrar resumen de oportunidades (stats, recientes, follow-ups).
- **Precondiciones:** usuario con dataset variado en estados y con/sin follow-up.
- **Criterios de aceptación:**
  - Las métricas por estado coinciden con oportunidades reales.
  - “Recent Opportunities” refleja orden por creación reciente.
  - “Upcoming Follow-ups” sólo muestra oportunidades con fecha futura.
- **Caso feliz:** cargar dashboard con datos existentes.
- **Casos alternativos:** estado vacío muestra empty states correctos.
- **Edge cases:** follow-up en fecha pasada no aparece en “Upcoming”.
- **Validaciones visuales/UI:** cards de stats correctas, enlaces de navegación funcionales.
- **Validaciones de persistencia DB:** cambios CRUD previos impactan dashboard tras refresco o actualización de contexto.
- **Validaciones de permisos/ownership:** sólo datos del usuario autenticado.
- **Validaciones de manejo de error:** si falla carga inicial, no romper layout global.
- **Prioridad:** P1.

### F05 — Listado de oportunidades
- **Objetivo funcional:** listar oportunidades y permitir filtrado por búsqueda, ubicación y modalidad.
- **Precondiciones:** múltiples oportunidades con combinaciones de company/title/location/workMode.
- **Criterios de aceptación:**
  - La lista inicial incluye todas las oportunidades del usuario.
  - Filtros combinados reducen resultados correctamente.
  - “Clear filters” restablece el set completo.
- **Caso feliz:** filtrar por texto + location + workMode.
- **Casos alternativos:** sin resultados, mostrar empty state de búsqueda.
- **Edge cases:** búsqueda con espacios/case mixing mantiene comportamiento consistente.
- **Validaciones visuales/UI:** contador total, cards correctas y acción de add visible.
- **Validaciones de persistencia DB:** al refrescar, listado mantiene estado persistido.
- **Validaciones de permisos/ownership:** no aparecen oportunidades de terceros.
- **Validaciones de manejo de error:** ante fallo de carga, no crashea pantalla.
- **Prioridad:** P1.

### F06 — Alta de oportunidad
- **Objetivo funcional:** crear una oportunidad nueva y reflejarla en el sistema inmediatamente.
- **Precondiciones:** usuario autenticado en `/opportunities/new`.
- **Criterios de aceptación:**
  - Validaciones obligatorias bloquean submit inválido (title/company/location/workMode).
  - URL inválida muestra mensaje de validación.
  - Al guardar válido, se crea oportunidad en status `saved` y aparece en listado sin recargar.
  - Se registra actividad `created` para la oportunidad.
- **Caso feliz:** alta completa con campos opcionales.
- **Casos alternativos:** alta con sourceUrl/notes vacíos.
- **Edge cases:** doble click en submit no duplica registros (por estado de submit y/o backend).
- **Validaciones visuales/UI:** botón “Saving...” durante submit; redirección a `/opportunities`.
- **Validaciones de persistencia DB:** nueva fila en `opportunities`; nueva fila en `activities` tipo `created`.
- **Validaciones de permisos/ownership:** `user_id` asociado al usuario autenticado (vía policy/default).
- **Validaciones de manejo de error:** si falla create, mostrar feedback visible y liberar submit.
- **Prioridad:** P0.

### F07 — Edición de oportunidad
- **Objetivo funcional:** modificar datos de oportunidad existente.
- **Precondiciones:** oportunidad existente visible por el usuario.
- **Criterios de aceptación:**
  - Formulario precarga datos actuales.
  - Validaciones de campos obligatorios y URL aplican igual que en alta.
  - Al guardar, detalle refleja cambios sin inconsistencias.
  - Si se actualiza follow-up (cuando el input exista en flujo), se persiste en `followups`.
- **Caso feliz:** edición de título, company y notes.
- **Casos alternativos:** edición parcial de un campo.
- **Edge cases:** oportunidad inexistente muestra estado not-found coherente.
- **Validaciones visuales/UI:** “Saving...” y retorno a detalle.
- **Validaciones de persistencia DB:** `opportunities` actualizada; `followups` upsert/delete según valor.
- **Validaciones de permisos/ownership:** no editar oportunidades de otro usuario.
- **Validaciones de manejo de error:** fallo PATCH muestra feedback y desbloquea botón.
- **Prioridad:** P0.

### F08 — Borrado de oportunidad
- **Objetivo funcional:** eliminar oportunidad y datos asociados.
- **Precondiciones:** oportunidad existente con posible actividad/follow-up.
- **Criterios de aceptación:**
  - Confirmación previa requerida.
  - Tras confirmar, la oportunidad desaparece de listado, detalle y pipeline.
  - Se eliminan registros relacionados (`activities`, `followups`) según repositorio Supabase.
- **Caso feliz:** borrar desde detalle y volver a listado.
- **Casos alternativos:** cancelar confirmación no borra nada.
- **Edge cases:** error parcial en borrado de tablas relacionadas debe reportarse.
- **Validaciones visuales/UI:** feedback de éxito implícito en UI (desaparición); si falla, error visible.
- **Validaciones de persistencia DB:** ausencia de filas en `opportunities`, `activities`, `followups` para `opportunity_id`.
- **Validaciones de permisos/ownership:** no borrar registros de otro usuario.
- **Validaciones de manejo de error:** si falla delete, UI no debe quedar en estado inconsistente.
- **Prioridad:** P0.

### F09 — Cambio de estado
- **Objetivo funcional:** actualizar status de oportunidad y mantener reglas de dominio.
- **Precondiciones:** oportunidad existente en cualquier estado.
- **Criterios de aceptación:**
  - Cambio de estado actualiza badge y ubicación en pipeline.
  - Al pasar a `applied`, se setea `applied_date` sólo si estaba vacío.
  - Si se re-selecciona mismo estado, no se crea actividad redundante.
- **Caso feliz:** `saved` → `applied` desde detalle.
- **Casos alternativos:** cambio desde pipeline (D&D) o acción contextual.
- **Edge cases:** `applied` → otro estado conserva `applied_date`.
- **Validaciones visuales/UI:** cambio visible inmediato en card y detalle.
- **Validaciones de persistencia DB:** `status` y `applied_date` persistidos; actividad `status_changed` cuando corresponde.
- **Validaciones de permisos/ownership:** sólo dueño puede cambiar estado.
- **Validaciones de manejo de error:** error en update muestra toast y no deja estado fantasma.
- **Prioridad:** P0.

### F10 — Add to pipeline
- **Objetivo funcional:** mover rápidamente oportunidad a estado `applied` desde card.
- **Precondiciones:** oportunidad en estado distinto de `applied`.
- **Criterios de aceptación:**
  - Acción “Add to pipeline” cambia estado a `applied`.
  - La oportunidad aparece en columna Applied en pipeline.
  - Se aplican reglas de `applied_date` y actividad igual que en cambio de estado.
- **Caso feliz:** ejecutar desde dropdown de card en listado.
- **Casos alternativos:** si ya está en `applied`, acción no genera mutación redundante.
- **Edge cases:** operación fallida no deja UI en estado incorrecto.
- **Validaciones visuales/UI:** badge actualizado y navegación posterior coherente.
- **Validaciones de persistencia DB:** `status=applied` persistido.
- **Validaciones de permisos/ownership:** sin privilegios cruzados entre usuarios.
- **Validaciones de manejo de error:** feedback visible en fallo.
- **Prioridad:** P1.

### F11 — Pipeline drag & drop
- **Objetivo funcional:** permitir cambio de estado por arrastre entre columnas.
- **Precondiciones:** al menos una oportunidad en pipeline.
- **Criterios de aceptación:**
  - Se puede arrastrar card y soltar en otra columna.
  - Drop actualiza status y persiste.
  - Reingreso/refresh mantiene nueva columna.
- **Caso feliz:** mover `saved` → `interview`.
- **Casos alternativos:** soltar en misma columna no cambia datos.
- **Edge cases:** drop interrumpido/cancelado restablece estado de drag visual.
- **Validaciones visuales/UI:** highlight de columna destino y recuento de badges por columna actualizado.
- **Validaciones de persistencia DB:** `status` actualizado en `opportunities`.
- **Validaciones de permisos/ownership:** sólo registros del usuario actual.
- **Validaciones de manejo de error:** error de actualización no debe dejar columna mal sincronizada tras refresh.
- **Prioridad:** P0.

### F12 — Opportunity details
- **Objetivo funcional:** mostrar información completa y acciones de una oportunidad.
- **Precondiciones:** oportunidad existente.
- **Criterios de aceptación:**
  - Se muestran campos principales (title/company/location/status/workMode/created).
  - Si existen, se muestran `appliedDate`, `followUpDate`, `notes`, `sourceUrl`.
  - Acciones disponibles (editar, pipeline, borrar, cambiar status) operan correctamente.
- **Caso feliz:** abrir detalle desde card.
- **Casos alternativos:** oportunidad inexistente responde con not-found.
- **Edge cases:** fuente sin URL no renderiza botón externo.
- **Validaciones visuales/UI:** timeline ordenado por fecha descendente y estados legibles.
- **Validaciones de persistencia DB:** datos mostrados coinciden con DB tras refresh.
- **Validaciones de permisos/ownership:** no visualizar detalle de otro usuario.
- **Validaciones de manejo de error:** transiciones/acciones con feedback en falla.
- **Prioridad:** P1.

### F13 — Persistencia en Supabase
- **Objetivo funcional:** garantizar que todas las operaciones CRUD/status se reflejen correctamente en DB.
- **Precondiciones:** entorno Supabase con migraciones aplicadas.
- **Criterios de aceptación:**
  - Create, update, status update y delete modifican tablas esperadas.
  - Relación oportunidades-activities-followups mantiene consistencia.
  - Tras refresh de app, estado observado coincide con DB.
- **Caso feliz:** ciclo completo create → edit → status → delete.
- **Casos alternativos:** operar con campos opcionales vacíos.
- **Edge cases:** upsert de follow-up sin constraint único documentado (validar comportamiento real).
- **Validaciones visuales/UI:** UI refleja último estado persistido tras recarga dura.
- **Validaciones de persistencia DB:** verificación directa con SQL/console Supabase.
- **Validaciones de permisos/ownership:** RLS bloquea mutaciones fuera del dueño.
- **Validaciones de manejo de error:** errores REST propagados a UI sin crash.
- **Prioridad:** P0.

### F14 — Visibilidad por usuario (ownership)
- **Objetivo funcional:** asegurar aislamiento de datos entre usuarios.
- **Precondiciones:** dos usuarios A/B con datos propios.
- **Criterios de aceptación:**
  - A sólo lista y opera sobre datos de A.
  - B no puede leer/editar/borrar IDs de A por URL o llamadas directas.
- **Caso feliz:** sesión A ve sólo A.
- **Casos alternativos:** logout/login como B y validación de separación.
- **Edge cases:** intento manual de acceder `/opportunities/{id_de_otro_usuario}`.
- **Validaciones visuales/UI:** datos cambian completamente al cambiar de usuario.
- **Validaciones de persistencia DB:** queries autenticadas no retornan filas ajenas.
- **Validaciones de permisos/ownership:** RLS efectiva en `opportunities`, `activities`, `followups`.
- **Validaciones de manejo de error:** acceso denegado no debe exponer datos sensibles.
- **Prioridad:** P0.

### F15 — Manejo de errores
- **Objetivo funcional:** proveer feedback claro y evitar UI bloqueada ante fallos.
- **Precondiciones:** capacidad de simular fallos de red/401/500 o configuración inválida.
- **Criterios de aceptación:**
  - Fallos CRUD de escritura muestran toast destructivo con mensaje.
  - `isSubmitting` vuelve a `false` en formularios new/edit aun con error.
  - Errores de auth en login/signup muestran mensaje visible.
- **Caso feliz:** operación falla y usuario puede reintentar sin recargar.
- **Casos alternativos:** falla en `refreshOpportunities` durante carga inicial.
- **Edge cases:** error desconocido sin mensaje debe mostrar fallback utilizable.
- **Validaciones visuales/UI:** no quedan botones bloqueados indefinidamente.
- **Validaciones de persistencia DB:** en fallo, no quedan escrituras parciales silenciosas en UI.
- **Validaciones de permisos/ownership:** errores de autorización tratados como error funcional visible.
- **Validaciones de manejo de error:** logging técnico en consola + feedback usuario.
- **Prioridad:** P0.

### F16 — Recarga de datos al refrescar
- **Objetivo funcional:** asegurar consistencia tras refresh completo del navegador.
- **Precondiciones:** sesión válida y cambios recientes en oportunidades.
- **Criterios de aceptación:**
  - Tras F5, la app recarga oportunidades y actividades reales del repositorio activo.
  - Datos tras refresh coinciden con último estado persistido.
- **Caso feliz:** crear/editar/cambiar estado y luego refresh.
- **Casos alternativos:** refresh en rutas internas (`/pipeline`, `/opportunities/:id`).
- **Edge cases:** refresh con sesión vencida redirige a login.
- **Validaciones visuales/UI:** sin flickers críticos ni pantalla quebrada.
- **Validaciones de persistencia DB:** confirmación cruzada con registros reales en Supabase.
- **Validaciones de permisos/ownership:** refresh no mezcla datos de sesiones previas.
- **Validaciones de manejo de error:** si falla carga, se mantiene navegación estable.
- **Prioridad:** P0.

### F17 — Actividades / Timeline
- **Objetivo funcional:** reflejar eventos relevantes en detalle de oportunidad.
- **Precondiciones:** oportunidad con eventos de creación y cambios de estado.
- **Criterios de aceptación:**
  - Timeline muestra actividad `created` al alta.
  - Cambio de estado genera `status_changed` si hubo cambio real.
  - Orden del timeline es descendente por timestamp.
- **Caso feliz:** create + 2 cambios de estado.
- **Casos alternativos:** oportunidad sin actividad muestra estado vacío.
- **Edge cases:** actividades “best-effort” fallidas no deben romper render del detalle.
- **Validaciones visuales/UI:** icono y descripción correctos por tipo.
- **Validaciones de persistencia DB:** filas en `activities` consistentes con acciones ejecutadas.
- **Validaciones de permisos/ownership:** actividades ajenas no visibles.
- **Validaciones de manejo de error:** si falla creación de actividad en status update, oportunidad sigue actualizada.
- **Prioridad:** P1.

## Acceptance Criteria by Feature

### Criterios P0 (bloqueantes de salida)
- OAuth permite entrar y mantener sesión válida en dashboard.
- Usuario no autenticado no accede a zonas protegidas.
- Create/Edit/Delete/Status funcionan con persistencia verificable y sin UI bloqueada.
- Drag & drop de pipeline persiste status real.
- RLS/ownership garantiza aislamiento estricto entre usuarios.
- Refresh de navegador conserva consistencia con DB o redirige a login si sesión no válida.

### Criterios P1 (alta prioridad)
- Dashboard y listado muestran datos consistentes tras mutaciones.
- Add to pipeline aplica exactamente misma regla de dominio que status update.
- Timeline refleja eventos esperados y mantiene orden correcto.

### Criterios P2 (complementarios)
- UX de empty states, navegación y filtros mantiene consistencia en escenarios límite.
- Paridad memory/supabase validada en reglas críticas (`appliedDate`, no-activity en no-change, borrado lógico visible).

## Risks and Ambiguities

1. **Protección de rutas client-side con posible flash de contenido.**
   - Riesgo: exposición visual breve de contenido protegido antes de redirección.
   - Impacto: seguridad percibida/UX.
   - Acción de validación: test explícito de hard refresh sin sesión en rutas protegidas.

2. **Comportamiento de refresh de sesión parcialmente documentado en histórico.**
   - Ambigüedad: documentación previa marcaba ausencia de refresh flow, pero helper actual incluye intento de refresh token en llamadas REST.
   - Impacto: potencial diferencia entre expectativa y comportamiento real.
   - Acción de validación: pruebas con token expirado + refresh válido/inválido.

3. **Follow-up funcionalmente parcial en UI de detalle.**
   - Ambigüedad: existe botón “Set Follow-up” sin flujo claro de edición desde detalle.
   - Impacto: criterio de aceptación de follow-up debe centrarse en persistencia vía edición/repositorio actual.
   - Acción de validación: delimitar alcance a paths realmente implementados.

4. **`followups` depende de constraint `on_conflict=opportunity_id` no plenamente explicitado en docs.**
   - Riesgo: upsert puede fallar según estado real del esquema.
   - Impacto: inconsistencia en persistencia de follow-up.
   - Acción de validación: comprobar constraint en DB y resultado de upsert.

5. **Error handling de carga inicial (`refreshOpportunities`) menos explícito en UX.**
   - Riesgo: error silencioso o poco accionable para usuario final.
   - Impacto: percepción de app vacía/sin datos.
   - Acción de validación: forzar error de carga y evaluar visibilidad del problema.

## Recommended Test Order

1. **Base de acceso y seguridad (P0):** F01 → F02 → F03 → F14.
2. **CRUD núcleo (P0):** F06 → F07 → F09 → F08.
3. **Pipeline y operación transversal (P0/P1):** F10 → F11.
4. **Consumo funcional completo UI (P1):** F05 → F12 → F17 → F04.
5. **Consistencia técnica end-to-end (P0/P1):** F13 → F16 → F15.
6. **Regresión rápida en memory (P2):** repetir subset crítico F06/F09/F08/F16 para paridad.

