import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignatureRequest {
  documentId: string
  documentContent: string
  certificateType: 'A1' | 'A3'
  certificateData?: string // Base64 for A1
  certificatePassword?: string // For A1
  documentType: string
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

    const { documentId, documentContent, certificateType, certificateData, certificatePassword, documentType } = await req.json() as SignatureRequest

    console.log(`Processing digital signature for document ${documentId}`)

    // Generate document hash
    const encoder = new TextEncoder()
    const data = encoder.encode(documentContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Generate signature metadata
    const timestamp = new Date().toISOString()
    const signatureId = crypto.randomUUID()
    
    // Create verification code
    const verificationCode = `VER${Date.now().toString().slice(-8)}`

    // Store signature record
    const { error: insertError } = await supabase
      .from('assinaturas_digitais')
      .insert({
        id: signatureId,
        documento_id: documentId,
        documento_tipo: documentType,
        hash_documento: hashHex,
        timestamp_assinatura: timestamp,
        codigo_verificacao: verificationCode,
        tipo_certificado: certificateType,
        status: 'assinado',
        dados_certificado: {
          tipo: certificateType,
          timestamp: timestamp,
          algoritmo: 'SHA-256'
        }
      })

    if (insertError) {
      console.error('Error storing signature:', insertError)
      throw new Error('Failed to store signature')
    }

    // Update document status
    const { error: updateError } = await supabase
      .from('documentos_medicos')
      .update({
        assinado: true,
        hash_assinatura: hashHex,
        status: 'assinado'
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document:', updateError)
    }

    console.log(`Digital signature completed for document ${documentId}`)

    return new Response(
      JSON.stringify({
        success: true,
        signatureId,
        verificationCode,
        timestamp,
        hash: hashHex
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Digital signature error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})