-- P0 security baseline: ownership + RLS for multi-user data isolation

alter table public.opportunities
  add column if not exists user_id uuid;

alter table public.opportunities
  alter column user_id set default auth.uid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'opportunities_user_id_fkey'
  ) then
    alter table public.opportunities
      add constraint opportunities_user_id_fkey
      foreign key (user_id)
      references auth.users (id)
      on delete cascade;
  end if;
end$$;

create index if not exists opportunities_user_id_idx on public.opportunities (user_id);
create index if not exists activities_opportunity_id_idx on public.activities (opportunity_id);
create index if not exists followups_opportunity_id_idx on public.followups (opportunity_id);

alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.followups enable row level security;

drop policy if exists "opportunities_select_own" on public.opportunities;
drop policy if exists "opportunities_insert_own" on public.opportunities;
drop policy if exists "opportunities_update_own" on public.opportunities;
drop policy if exists "opportunities_delete_own" on public.opportunities;

create policy "opportunities_select_own"
  on public.opportunities
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "opportunities_insert_own"
  on public.opportunities
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "opportunities_update_own"
  on public.opportunities
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "opportunities_delete_own"
  on public.opportunities
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "activities_select_own" on public.activities;
drop policy if exists "activities_insert_own" on public.activities;
drop policy if exists "activities_update_own" on public.activities;
drop policy if exists "activities_delete_own" on public.activities;

create policy "activities_select_own"
  on public.activities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = activities.opportunity_id
        and o.user_id = auth.uid()
    )
  );

create policy "activities_insert_own"
  on public.activities
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.opportunities o
      where o.id = activities.opportunity_id
        and o.user_id = auth.uid()
    )
  );

create policy "activities_update_own"
  on public.activities
  for update
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

create policy "activities_delete_own"
  on public.activities
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = activities.opportunity_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "followups_select_own" on public.followups;
drop policy if exists "followups_insert_own" on public.followups;
drop policy if exists "followups_update_own" on public.followups;
drop policy if exists "followups_delete_own" on public.followups;

create policy "followups_select_own"
  on public.followups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = followups.opportunity_id
        and o.user_id = auth.uid()
    )
  );

create policy "followups_insert_own"
  on public.followups
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.opportunities o
      where o.id = followups.opportunity_id
        and o.user_id = auth.uid()
    )
  );

create policy "followups_update_own"
  on public.followups
  for update
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

create policy "followups_delete_own"
  on public.followups
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = followups.opportunity_id
        and o.user_id = auth.uid()
    )
  );
