-- Pegar y ejecutar en Supabase › SQL Editor › New query › Run
-- Guarda todos los datos del sistema en UNA fila compartida por tus usuarios.

create table if not exists public.datos (
  id          int primary key,
  data        jsonb not null default '{}'::jsonb,
  version     int not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

alter table public.datos enable row level security;

-- Solo usuarios con sesión iniciada (los que vos creás) pueden leer y escribir.
drop policy if exists "leer" on public.datos;
drop policy if exists "insertar" on public.datos;
drop policy if exists "actualizar" on public.datos;
create policy "leer"       on public.datos for select to authenticated using (true);
create policy "insertar"   on public.datos for insert to authenticated with check (id = 1);
create policy "actualizar" on public.datos for update to authenticated using (id = 1) with check (id = 1);

-- Registra quién y cuándo modificó
create or replace function public.datos_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists datos_touch on public.datos;
create trigger datos_touch before update on public.datos
  for each row execute function public.datos_touch();

-- Fila inicial vacía
insert into public.datos (id, data, version) values (1, '{}'::jsonb, 0)
on conflict (id) do nothing;
