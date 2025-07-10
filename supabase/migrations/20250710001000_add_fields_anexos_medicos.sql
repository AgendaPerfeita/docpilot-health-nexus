-- Adiciona campos para suportar uploads de staff, clinica e paciente
alter table public.anexos_medicos
add column staff_id uuid null,
add column clinica_id uuid null,
add column paciente_upload_id uuid null,
add column enviado_no_chat boolean not null default false; 