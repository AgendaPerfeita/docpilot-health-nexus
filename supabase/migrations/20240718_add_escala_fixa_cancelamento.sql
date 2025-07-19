CREATE TABLE plantonista_escala_fixa_cancelamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_fixa_id uuid NOT NULL REFERENCES plantonista_escala_fixa(id) ON DELETE CASCADE,
  data_cancelamento timestamptz NOT NULL DEFAULT now(),
  motivo text NOT NULL,
  usuario_id uuid NOT NULL REFERENCES profiles(id)
); 