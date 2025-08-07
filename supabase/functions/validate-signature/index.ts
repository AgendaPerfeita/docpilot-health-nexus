import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store (in production, use Redis or similar)
const validationAttempts = new Map<string, { count: number; lastAttempt: number }>()

const RATE_LIMIT = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = validationAttempts.get(ip)
  
  if (!attempts) {
    validationAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset if window expired
  if (now - attempts.lastAttempt > RATE_LIMIT.windowMs) {
    validationAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }
  
  // Check if limit exceeded
  if (attempts.count >= RATE_LIMIT.maxAttempts) {
    return false
  }
  
  // Increment attempts
  attempts.count++
  attempts.lastAttempt = now
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ valid: false, error: 'Método não permitido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Muitas tentativas. Tente novamente em 15 minutos.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { verificationCode } = await req.json()

    if (!verificationCode || typeof verificationCode !== 'string') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Código de verificação é obrigatório' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Validating signature with code: ${verificationCode}`)

    // Log validation attempt for auditing
    await supabase
      .from('documentos_auditoria')
      .insert({
        acao: 'validacao_publica',
        dados_contexto: {
          codigo_verificacao: verificationCode,
          ip: clientIP,
          user_agent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      })
      .select()

    // Get signature data with complete document and doctor info
    const { data: signature, error } = await supabase
      .from('assinaturas_digitais')
      .select(`
        *,
        documentos_medicos!inner(
          id,
          titulo,
          tipo,
          conteudo,
          numero_documento,
          created_at,
          medico_id,
          status,
          profiles!inner(
            nome, 
            crm, 
            especialidade,
            email,
            telefone
          )
        )
      `)
      .eq('codigo_verificacao', verificationCode)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Erro interno do servidor' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!signature) {
      console.log(`Verification code not found: ${verificationCode}`)
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
    const documentData = signature.documentos_medicos

    console.log(`Signature validation result: ${isValid} for document ${documentData.id}`)

    // Log successful validation
    if (isValid) {
      await supabase
        .from('documentos_auditoria')
        .insert({
          documento_id: documentData.id,
          acao: 'validacao_sucesso',
          dados_contexto: {
            codigo_verificacao: verificationCode,
            ip: clientIP,
            hash_validado: currentHash,
            timestamp: new Date().toISOString()
          }
        })
        .select()
    }

    return new Response(
      JSON.stringify({
        valid: isValid,
        message: isValid ? 'Assinatura válida' : 'Documento foi alterado após a assinatura',
        signature: {
          id: signature.id,
          timestamp: signature.timestamp_assinatura,
          certificateType: signature.tipo_certificado,
          verificationCode: signature.codigo_verificacao,
          hashDocument: signature.hash_documento,
          isIntegrityValid: isValid
        },
        document: {
          id: documentData.id,
          title: documentData.titulo,
          type: documentData.tipo,
          number: documentData.numero_documento,
          status: documentData.status,
          createdAt: documentData.created_at
        },
        doctor: {
          name: documentData.profiles.nome,
          crm: documentData.profiles.crm,
          specialty: documentData.profiles.especialidade,
          email: documentData.profiles.email,
          phone: documentData.profiles.telefone
        },
        validatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Signature validation error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erro interno durante a validação' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})