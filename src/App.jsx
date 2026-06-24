create table resenas (
  id uuid default gen_random_uuid() primary key,
  reserva_id uuid references reservas(id) on delete set null,
  token text unique default gen_random_uuid()::text,
  huesped_nombre text,
  calificacion integer check (calificacion between 1 and 5),
  comentario text,
  created_at timestamp default now()
);

alter table resenas enable row level security;

-- Admin puede ver todo
create policy "Admin puede todo en resenas"
  on resenas for all
  to authenticated
  using (true)
  with check (true);

-- Público puede insertar (enviar reseña por link)
create policy "Publico puede insertar resena"
  on resenas for insert
  to anon
  with check (true);

-- Público puede leer reseñas (para página pública)
create policy "Publico puede leer resenas"
  on resenas for select
  to anon
  using (true);
