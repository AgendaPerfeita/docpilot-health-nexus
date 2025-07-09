-- Migration: Criação da tabela de notificações unificadas (corrigida para user_id correto)

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade, -- destinatário
  tipo text not null, -- 'chat', 'agendamento', 'sistema', etc.
  titulo text,        -- título curto da notificação
  mensagem text,      -- mensagem detalhada
  contexto jsonb,     -- dados extras (ex: {consulta_id, chat_id, ...})
  lida boolean not null default false,
  criada_em timestamptz not null default now(),
  lida_em timestamptz,
  prioridade text default 'normal', -- 'normal', 'alta', etc.
  deleted boolean not null default false
);

-- Índices para performance
create index idx_notificacoes_user_id_lida on public.notificacoes(user_id, lida);
create index idx_notificacoes_criada_em on public.notificacoes(criada_em desc);

-- Trigger para marcar lida_em ao atualizar lida=true
create or replace function public.set_lida_em()
returns trigger as $$
begin
  if new.lida = true and old.lida = false then
    new.lida_em := now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_lida_em_trigger
before update on public.notificacoes
for each row
when (old.lida is distinct from new.lida)
execute procedure public.set_lida_em();

-- Trigger para notificar novo agendamento (insert em consultas)
create or replace function public.notify_novo_agendamento()
returns trigger as $$
begin
  -- Notifica o paciente (user_id do responsável pelo paciente)
  insert into public.notificacoes (
    user_id, tipo, titulo, mensagem, contexto
  ) values (
    (select user_id from public.profiles where id = (select responsavel_id from public.pacientes where id = new.paciente_id)),
    'agendamento',
    'Nova consulta agendada',
    'Sua consulta foi agendada para ' || to_char(new.data_consulta, 'DD/MM/YYYY HH24:MI'),
    jsonb_build_object('consulta_id', new.id)
  );
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
$$ language plpgsql;

create trigger trigger_notify_novo_agendamento
after insert on public.consultas
for each row
execute procedure public.notify_novo_agendamento();

-- Trigger para notificar alteração/cancelamento de agendamento (update em consultas)
create or replace function public.notify_update_agendamento()
returns trigger as $$
declare
  msg_paciente text;
  msg_medico text;
  msg_clinica text;
  titulo_paciente text;
  titulo_medico text;
  titulo_clinica text;
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

    -- Notifica o paciente (user_id do responsável pelo paciente)
    insert into public.notificacoes (
      user_id, tipo, titulo, mensagem, contexto
    ) values (
      (select user_id from public.profiles where id = (select responsavel_id from public.pacientes where id = new.paciente_id)),
      'agendamento',
      titulo_paciente,
      msg_paciente,
      jsonb_build_object('consulta_id', new.id)
    );

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
$$ language plpgsql;

create trigger trigger_notify_update_agendamento
after update on public.consultas
for each row
when (old.status is distinct from new.status)
execute procedure public.notify_update_agendamento();

-- RLS: Somente o destinatário pode ver/alterar suas notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário só vê suas notificações" ON public.notificacoes
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuário pode marcar como lida/deletar" ON public.notificacoes
  FOR UPDATE USING (user_id = auth.uid()); 