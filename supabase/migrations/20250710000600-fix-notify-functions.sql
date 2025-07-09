-- Migration: Corrigir functions de notificação para o novo modelo multi-clínica/multi-médico

-- Recriar a function notify_nova_mensagem_chat sem usar responsavel_id
CREATE OR REPLACE FUNCTION public.notify_nova_mensagem_chat()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
declare
  destinatario_profile_id uuid;
  destinatario_user_id uuid;
  titulo text;
  mensagem text;
  contexto jsonb;
  consulta_clinica_id uuid;
  staff_rec RECORD;
  paciente_profile_id uuid;
begin
  -- Só notifica se a mensagem não for do próprio usuário (não notificar o autor)
  
  -- Notificar médico quando paciente envia mensagem
  if new.author_type = 'patient' then
    -- Buscar médico vinculado ao paciente via paciente_medico
    destinatario_profile_id := (
      select pm.medico_id from public.paciente_medico pm
      where pm.paciente_id = new.patient_id
      order by pm.created_at desc limit 1
    );
    
    if destinatario_profile_id is not null and destinatario_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = destinatario_profile_id);
      titulo := 'Nova mensagem de paciente';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
    
    -- Notificar clínica (se houver) via paciente_clinica
    consulta_clinica_id := (
      select pc.clinica_id from public.paciente_clinica pc
      where pc.paciente_id = new.patient_id
      order by pc.created_at desc limit 1
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
  
  -- Notificar paciente quando médico envia mensagem
  elsif new.author_type = 'doctor' then
    -- Buscar paciente autenticado via CPF (se tiver profile)
    paciente_profile_id := (
      select p.id from public.profiles p
      where p.tipo = 'paciente' 
        and p.documento = (select cpf from public.pacientes where id = new.patient_id)
    );
    
    if paciente_profile_id is not null and paciente_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = paciente_profile_id);
      titulo := 'Nova mensagem do médico';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
  
  -- Notificar paciente quando clínica/staff envia mensagem
  elsif new.author_type in ('clinic', 'staff') and new.clinica_id is not null then
    -- Buscar paciente autenticado via CPF (se tiver profile)
    paciente_profile_id := (
      select p.id from public.profiles p
      where p.tipo = 'paciente' 
        and p.documento = (select cpf from public.pacientes where id = new.patient_id)
    );
    
    if paciente_profile_id is not null and paciente_profile_id != new.author_id then
      destinatario_user_id := (select user_id from public.profiles where id = paciente_profile_id);
      titulo := 'Nova mensagem da clínica';
      mensagem := coalesce(new.content, '[Anexo]');
      contexto := jsonb_build_object('tipo', 'chat', 'patient_id', new.patient_id);
      insert into public.notificacoes (user_id, tipo, titulo, mensagem, contexto)
      values (destinatario_user_id, 'chat', titulo, mensagem, contexto);
    end if;
  end if;
  
  return new;
end;
$function$;

-- Recriar a function notify_novo_agendamento sem usar responsavel_id
CREATE OR REPLACE FUNCTION public.notify_novo_agendamento()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
declare
  paciente_profile_id uuid;
begin
  -- Buscar paciente autenticado via CPF (se tiver profile)
  paciente_profile_id := (
    select p.id from public.profiles p
    where p.tipo = 'paciente' 
      and p.documento = (select cpf from public.pacientes where id = new.paciente_id)
  );
  
  -- Notifica o paciente (se tiver profile autenticado)
  if paciente_profile_id is not null then
    insert into public.notificacoes (
      user_id, tipo, titulo, mensagem, contexto
    ) values (
      (select user_id from public.profiles where id = paciente_profile_id),
      'agendamento',
      'Nova consulta agendada',
      'Sua consulta foi agendada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI'),
      jsonb_build_object('consulta_id', new.id)
    );
  end if;
  
  -- Notifica o médico
  insert into public.notificacoes (
    user_id, tipo, titulo, mensagem, contexto
  ) values (
    (select user_id from public.profiles where id = new.medico_id),
    'agendamento',
    'Nova consulta agendada',
    'Você tem uma nova consulta agendada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI'),
    jsonb_build_object('consulta_id', new.id)
  );
  
  -- Notifica a clínica, se houver
  if new.clinica_id is not null then
    insert into public.notificacoes (
      user_id, tipo, titulo, mensagem, contexto
    ) values (
      (select user_id from public.profiles where id = new.clinica_id),
      'agendamento',
      'Nova consulta agendada',
      'Uma nova consulta foi agendada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI'),
      jsonb_build_object('consulta_id', new.id)
    );
  end if;
  
  return new;
end;
$function$;

-- Recriar a function notify_update_agendamento sem usar responsavel_id
CREATE OR REPLACE FUNCTION public.notify_update_agendamento()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
declare
  msg_paciente text;
  msg_medico text;
  msg_clinica text;
  titulo_paciente text;
  titulo_medico text;
  titulo_clinica text;
  paciente_profile_id uuid;
begin
  -- Só notifica se o status mudou
  if new.status is distinct from old.status then
    if new.status = 'confirmada' then
      titulo_paciente := 'Consulta confirmada';
      msg_paciente := 'Sua consulta em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || ' foi confirmada.';
      titulo_medico := 'Consulta confirmada';
      msg_medico := 'A consulta com o paciente foi confirmada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || '.';
      titulo_clinica := 'Consulta confirmada';
      msg_clinica := 'Uma consulta foi confirmada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || '.';
    elsif new.status = 'cancelada' then
      titulo_paciente := 'Consulta cancelada';
      msg_paciente := 'Sua consulta em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || ' foi cancelada.';
      titulo_medico := 'Consulta cancelada';
      msg_medico := 'A consulta com o paciente em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || ' foi cancelada.';
      titulo_clinica := 'Consulta cancelada';
      msg_clinica := 'Uma consulta foi cancelada em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || '.';
    elsif new.status = 'em_andamento' then
      titulo_paciente := 'Consulta iniciada';
      msg_paciente := 'Sua consulta em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || ' foi iniciada.';
      titulo_medico := 'Consulta iniciada';
      msg_medico := 'A consulta com o paciente foi iniciada.';
      titulo_clinica := 'Consulta iniciada';
      msg_clinica := 'Uma consulta foi iniciada em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || '.';
    elsif new.status = 'concluida' then
      titulo_paciente := 'Consulta concluída';
      msg_paciente := 'Sua consulta em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || ' foi concluída.';
      titulo_medico := 'Consulta concluída';
      msg_medico := 'A consulta com o paciente foi concluída.';
      titulo_clinica := 'Consulta concluída';
      msg_clinica := 'Uma consulta foi concluída em ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI') || '.';
    else
      return new;
    end if;

    -- Buscar paciente autenticado via CPF (se tiver profile)
    paciente_profile_id := (
      select p.id from public.profiles p
      where p.tipo = 'paciente' 
        and p.documento = (select cpf from public.pacientes where id = new.paciente_id)
    );

    -- Notifica o paciente (se tiver profile autenticado)
    if paciente_profile_id is not null then
      insert into public.notificacoes (
        user_id, tipo, titulo, mensagem, contexto
      ) values (
        (select user_id from public.profiles where id = paciente_profile_id),
        'agendamento',
        titulo_paciente,
        msg_paciente,
        jsonb_build_object('consulta_id', new.id)
      );
    end if;

    -- Notifica o médico
    insert into public.notificacoes (
      user_id, tipo, titulo, mensagem, contexto
    ) values (
      (select user_id from public.profiles where id = new.medico_id),
      'agendamento',
      titulo_medico,
      msg_medico,
      jsonb_build_object('consulta_id', new.id)
    );

    -- Notifica a clínica, se houver
    if new.clinica_id is not null then
      insert into public.notificacoes (
        user_id, tipo, titulo, mensagem, contexto
      ) values (
        (select user_id from public.profiles where id = new.clinica_id),
        'agendamento',
        titulo_clinica,
        msg_clinica,
        jsonb_build_object('consulta_id', new.id)
      );
    end if;
  end if;
  
  return new;
end;
$function$; 