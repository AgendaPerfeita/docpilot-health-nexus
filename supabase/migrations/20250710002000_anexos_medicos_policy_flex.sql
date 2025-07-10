-- Remove a policy antiga, se existir
DROP POLICY IF EXISTS "Médicos podem gerenciar seus anexos" ON public.anexos_medicos;

-- Cria a nova policy para todos os tipos de usuário (médico, staff, clínica, paciente)
CREATE POLICY "Gerenciar anexos por tipo de usuário"
ON public.anexos_medicos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND (
        (profiles.id = anexos_medicos.medico_id AND profiles.tipo = 'medico')
        OR (profiles.id = anexos_medicos.staff_id AND profiles.tipo = 'staff')
        OR (profiles.id = anexos_medicos.clinica_id AND profiles.tipo = 'clinica')
        OR (profiles.id = anexos_medicos.paciente_upload_id AND profiles.tipo = 'paciente')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND (
        (profiles.id = anexos_medicos.medico_id AND profiles.tipo = 'medico')
        OR (profiles.id = anexos_medicos.staff_id AND profiles.tipo = 'staff')
        OR (profiles.id = anexos_medicos.clinica_id AND profiles.tipo = 'clinica')
        OR (profiles.id = anexos_medicos.paciente_upload_id AND profiles.tipo = 'paciente')
      )
  )
); 