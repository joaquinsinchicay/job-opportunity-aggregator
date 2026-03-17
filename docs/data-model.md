# Data Model

## Modelo de dominio en frontend

### Opportunity
Campos relevantes:
- `id`, `title`, `company`, `location`
- `workMode` (`remote|hybrid|onsite`)
- `status` (`saved|applied|interview|offer|rejected`)
- `sourceUrl`, `notes`
- `createdAt`, `appliedDate?`, `followUpDate?`

### ActivityItem
Campos relevantes:
- `id`, `opportunityId`
- `type` (`created|status_changed|pipeline_added|note_added|followup_set`)
- `description`, `timestamp`
- `metadata.fromStatus/toStatus?`

## Modelo persistido en Supabase (inferido por repositorio + migración)
- `opportunities`
  - columnas: `id`, `title`, `company`, `location`, `work_mode`, `status`, `source_url`, `notes`, `created_at`, `applied_date`, `user_id`.
- `activities`
  - columnas: `id`, `opportunity_id`, `type`, `description`, `created_at`, `metadata`.
- `followups`
  - columnas usadas: `opportunity_id`, `follow_up_date` (también contempla aliases legacy: `scheduled_for`, `due_at`).

## Relaciones
- `opportunities (1) -> (N) activities` por `activities.opportunity_id`.
- `opportunities (1) -> (0..1) followups` por `followups.opportunity_id` (upsert con conflicto por oportunidad).
- `opportunities.user_id -> auth.users.id` para ownership.

## Inconsistencias detectadas
1. Frontend maneja `followUpDate` dentro de `Opportunity`, pero en DB vive en tabla separada `followups`.
2. Repositorio soporta aliases de columnas (`scheduled_for`, `due_at`), señal de variabilidad histórica del esquema.
3. Regla vigente y consistente en ambos repositorios: al cambiar a `applied`, se setea `applied_date` únicamente si estaba vacío; en cambios posteriores de estado se conserva el valor.
