import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { verificationCode } = await req.json()

    console.log(`Validating signature with code: ${verificationCode}`)

    // Get signature data
    const { data: signature, error } = await supabase
      .from('assinaturas_digitais')
      .select(`
        *,
        documentos_medicos!inner(
          titulo,
          tipo,
          conteudo,
          created_at,
          medico_id,
          profiles!inner(nome, crm, especialidade)
        )
      `)
      .eq('codigo_verificacao', verificationCode)
      .single()

    if (error || !signature) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Código de verificação não encontrado' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Validate document integrity
    const documentContent = signature.documentos_medicos.conteudo
    const encoder = new TextEncoder()
    const data = encoder.encode(documentContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const isValid = currentHash === signature.hash_documento

    console.log(`Signature validation result: ${isValid}`)

    return new Response(
      JSON.stringify({
        valid: isValid,
        signature: {
          id: signature.id,
          timestamp: signature.timestamp_assinatura,
          certificateType: signature.tipo_certificado,
          documentTitle: signature.documentos_medicos.titulo,
          documentType: signature.documentos_medicos.tipo,
          doctorName: signature.documentos_medicos.profiles.nome,
          doctorCrm: signature.documentos_medicos.profiles.crm,
          doctorSpecialty: signature.documentos_medicos.profiles.especialidade,
          verificationCode: signature.codigo_verificacao
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Signature validation error:', error)
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})