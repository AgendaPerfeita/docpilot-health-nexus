-- Migration: Trigger para notificação de chat (ajustada para notificar clínica também)

-- Função para inserir notificação ao receber nova mensagem de chat
create or replace function public.notify_nova_mensagem_chat()
returns trigger as $$
declare
  destinatario_profile_id uuid;
  destinatario_user_id uuid;
  titulo text;
  mensagem text;
  contexto jsonb;
  consulta_clinica_id uuid;
  staff_rec RECORD;
begin
  -- Só notifica se a mensagem não for do próprio usuário (não notificar o autor)
  -- Notificar médico
  if new.author_type = 'patient' then
    destinatario_profile_id := (
      select medico_id from public.pacientes p
      join public.consultas c on c.paciente_id = p.id
      where p.id = new.patient_id and c.status in ('agendada','confirmada','em_andamento')
      order by c.data_consulta desc limit 1
    );
    if destinatario_profile_id is not null and destinatario_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = destinatario_profile_id);
      titulo := 'Nova mensagem de paciente';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
    -- Notificar clínica (se houver)
    consulta_clinica_id := (
      select clinica_id from public.consultas c
      where c.paciente_id = new.patient_id and c.status in ('agendada','confirmada','em_andamento')
      order by c.data_consulta desc limit 1
    );
    if consulta_clinica_id is not null and consulta_clinica_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = consulta_clinica_id);
      titulo := 'Nova mensagem de paciente';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
      -- Notificar todos os staff vinculados à clínica
      for staff_rec in (
        select user_id from public.profiles where tipo = 'staff' and clinica_id = consulta_clinica_id
      ) loop
        insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
        values (staff_rec.user_id, 'chat', titulo, mensagem, contexto);
      end loop;
    end if;
  -- Notificar paciente
  elsif new.author_type = 'doctor' then
    destinatario_profile_id := (
      select responsavel_id from public.pacientes where id = new.patient_id
    );
    if destinatario_profile_id is not null and destinatario_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = destinatario_profile_id);
      titulo := 'Nova mensagem do médico';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
  -- Notificar clínica (atendente) → paciente
  elsif new.author_type = 'clinic' and new.clinica_id is not null then
    destinatario_profile_id := (
      select responsavel_id from public.pacientes where id = new.patient_id
    );
    if destinatario_profile_id is not null and destinatario_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = destinatario_profile_id);
      titulo := 'Nova mensagem da clínica';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger trigger_notify_nova_mensagem_chat
after insert on public.chat_mensagens
for each row
execute procedure public.notify_nova_mensagem_chat(); 