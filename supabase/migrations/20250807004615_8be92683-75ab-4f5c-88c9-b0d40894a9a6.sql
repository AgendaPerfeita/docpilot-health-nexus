-- Inserir templates básicos de prescrição médica
INSERT INTO public.templates_documentos (nome, tipo, especialidade, conteudo_template, variaveis, ativo) VALUES
(
  'Receita Médica Padrão',
  'receita',
  'geral',
  '<div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">
      <h1 style="font-size: 24px; margin: 0;">RECEITA MÉDICA</h1>
      <div style="margin-top: 10px;">
        <p style="margin: 2px;"><strong>Dr. {{medico_nome}}</strong></p>
        <p style="margin: 2px;">CRM: {{medico_crm}} - {{medico_especialidade}}</p>
        <p style="margin: 2px;">{{medico_endereco}}</p>
        <p style="margin: 2px;">Telefone: {{medico_telefone}}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 10px;">DADOS DO PACIENTE:</h3>
      <p style="margin: 5px 0;"><strong>Nome:</strong> {{paciente_nome}}</p>
      <p style="margin: 5px 0;"><strong>Data de Nascimento:</strong> {{paciente_data_nascimento}}</p>
      <p style="margin: 5px 0;"><strong>Documento:</strong> {{paciente_cpf}}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 15px;">PRESCRIÇÃO:</h3>
      <div style="margin-left: 20px;">
        {{medicamentos}}
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 10px;">INSTRUÇÕES GERAIS:</h3>
      <p style="margin-left: 20px; line-height: 1.6;">{{instrucoes}}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 10px;">OBSERVAÇÕES:</h3>
      <p style="margin-left: 20px; line-height: 1.6;">{{observacoes}}</p>
    </div>
    
    <div style="margin-top: 50px; text-align: center;">
      <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
        <p style="margin: 0;"><strong>Dr. {{medico_nome}}</strong></p>
        <p style="margin: 0;">CRM: {{medico_crm}}</p>
      </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
      <p>Data: {{data_emissao}} | Documento: {{numero_documento}}</p>
      <p>Assinado digitalmente em {{data_assinatura}}</p>
    </div>
  </div>',
  '{"medico_nome": "string", "medico_crm": "string", "medico_especialidade": "string", "medico_endereco": "string", "medico_telefone": "string", "paciente_nome": "string", "paciente_data_nascimento": "string", "paciente_cpf": "string", "medicamentos": "array", "instrucoes": "string", "observacoes": "string", "data_emissao": "string", "numero_documento": "string", "data_assinatura": "string"}',
  true
),
(
  'Atestado Médico Padrão',
  'atestado',
  'geral',
  '<div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">
      <h1 style="font-size: 24px; margin: 0;">ATESTADO MÉDICO</h1>
      <div style="margin-top: 10px;">
        <p style="margin: 2px;"><strong>Dr. {{medico_nome}}</strong></p>
        <p style="margin: 2px;">CRM: {{medico_crm}} - {{medico_especialidade}}</p>
        <p style="margin: 2px;">{{medico_endereco}}</p>
        <p style="margin: 2px;">Telefone: {{medico_telefone}}</p>
      </div>
    </div>
    
    <div style="text-align: justify; line-height: 1.8; margin: 40px 0;">
      <p style="text-indent: 50px;">
        Atesto para os devidos fins que o(a) paciente <strong>{{paciente_nome}}</strong>, 
        portador(a) do documento {{paciente_cpf}}, nascido(a) em {{paciente_data_nascimento}}, 
        esteve sob meus cuidados médicos e necessita de afastamento de suas atividades por 
        <strong>{{dias_afastamento}} dia(s)</strong>, no período de {{data_inicio}} a {{data_fim}}.
      </p>
      
      <p style="text-indent: 50px; margin-top: 20px;">
        {{observacoes_medicas}}
      </p>
    </div>
    
    <div style="margin-top: 60px; text-align: center;">
      <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
        <p style="margin: 0;"><strong>Dr. {{medico_nome}}</strong></p>
        <p style="margin: 0;">CRM: {{medico_crm}}</p>
      </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
      <p>{{cidade}}, {{data_emissao}}</p>
      <p>Documento: {{numero_documento}}</p>
      <p>Assinado digitalmente em {{data_assinatura}}</p>
    </div>
  </div>',
  '{"medico_nome": "string", "medico_crm": "string", "medico_especialidade": "string", "medico_endereco": "string", "medico_telefone": "string", "paciente_nome": "string", "paciente_data_nascimento": "string", "paciente_cpf": "string", "dias_afastamento": "string", "data_inicio": "string", "data_fim": "string", "observacoes_medicas": "string", "cidade": "string", "data_emissao": "string", "numero_documento": "string", "data_assinatura": "string"}',
  true
);