# Supabase Integration

## Conexión
- Variables esperadas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `getSupabaseClientConfig()` valida presencia y normaliza URL.
- Si no hay config, fábrica de repositorio cae a memoria.

## Estrategia de acceso
Sin SDK de Supabase JS; se usa `fetch` directo contra:
- `.../auth/v1/*` para autenticación.
- `.../rest/v1/*` para CRUD de dominio.

## Tablas consultadas/escritas
- `opportunities`: entidad principal.
- `activities`: timeline de eventos.
- `followups`: fecha de seguimiento por oportunidad.

## Flujos de persistencia
- **Listar:** `opportunities` + `followups` y merge por `opportunity_id`.
- **Crear oportunidad:** inserta en `opportunities` y luego `activities`.
- **Editar oportunidad:** PATCH en `opportunities` y upsert/delete en `followups`.
- **Cambio de estado:** PATCH en `opportunities` y creación best-effort en `activities`.
- **Eliminar:** borra `followups`, `activities` y `opportunities` en paralelo.

## RLS y ownership
Existe migración para:
- agregar `user_id` a `opportunities`.
- habilitar RLS en `opportunities`, `activities`, `followups`.
- políticas por `auth.uid()` y relación por `opportunity_id`.

## Problemas detectados
1. **Token expirado puede seguir enviándose en REST fetch** (helper usa `localStorage` directo en vez de `getAccessToken`).
2. **No hay refresh token flow**: al expirar sesión, se limpia y el usuario queda fuera.
3. **Errores de red no se normalizan por dominio**; llegan como `Error` genérico con texto de respuesta.
4. **No hay capa server-side intermedia**, por lo que toda la política de acceso depende de RLS correctamente configurada en Supabase.
