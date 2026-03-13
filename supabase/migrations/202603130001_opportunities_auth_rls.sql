-- P0: auth, ownership and RLS for opportunities domain

alter table public.opportunities
  add column if not exists user_id uuid references auth.users(id);

create or replace function public.set_opportunity_owner()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_opportunity_owner on public.opportunities;
create trigger set_opportunity_owner
before insert on public.opportunities
for each row
execute function public.set_opportunity_owner();

alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.followups enable row level security;

-- Opportunities: owner-only CRUD.
drop policy if exists "opportunities_select_own" on public.opportunities;
create policy "opportunities_select_own"
on public.opportunities
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "opportunities_insert_own" on public.opportunities;
create policy "opportunities_insert_own"
on public.opportunities
for insert
to authenticated
with check (coalesce(user_id, auth.uid()) = auth.uid());

drop policy if exists "opportunities_update_own" on public.opportunities;
create policy "opportunities_update_own"
on public.opportunities
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "opportunities_delete_own" on public.opportunities;
create policy "opportunities_delete_own"
on public.opportunities
for delete
to authenticated
using (user_id = auth.uid());

-- Related tables constrained through parent opportunity ownership.
drop policy if exists "activities_owner_access" on public.activities;
create policy "activities_owner_access"
on public.activities
for all
to authenticated
using (
  exists (
    select 1
    from public.opportunities o
    where o.id = activities.opportunity_id
      and o.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.opportunities o
    where o.id = activities.opportunity_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "followups_owner_access" on public.followups;
create policy "followups_owner_access"
on public.followups
for all
to authenticated
using (
  exists (
    select 1
    from public.opportunities o
    where o.id = followups.opportunity_id
      and o.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.opportunities o
    where o.id = followups.opportunity_id
      and o.user_id = auth.uid()
  )
);
