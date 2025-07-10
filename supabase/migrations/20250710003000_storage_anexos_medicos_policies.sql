-- Policies para o bucket anexos-medicos no Supabase Storage

-- Permitir upload (insert) para usuários autenticados
create policy "Allow authenticated upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'anexos-medicos' AND auth.role() = 'authenticated'
);

-- Permitir download (select) para usuários autenticados
create policy "Allow authenticated download"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'anexos-medicos' AND auth.role() = 'authenticated'
);

-- Permitir remoção (delete) para usuários autenticados
create policy "Allow authenticated delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'anexos-medicos' AND auth.role() = 'authenticated'
); 