import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string;
  medicoNome: string;
  clinicaNome: string;
  tipo: 'vinculo' | 'desvinculo';
}

const handler = async (req: Request): Promise<Response> => {
  console.log('send-medico-notification function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, medicoNome, clinicaNome, tipo }: NotificationRequest = await req.json();
    console.log('Sending notification to:', to, 'type:', tipo);

    const isVinculo = tipo === 'vinculo';
    const subject = isVinculo 
      ? `Você foi adicionado à ${clinicaNome}` 
      : `Você foi removido da ${clinicaNome}`;

    const emailResponse = await resend.emails.send({
      from: "SmartDoc <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">SmartDoc - Atualização de Vínculo</h1>
          
          <p>Olá <strong>${medicoNome}</strong>,</p>
          
          ${isVinculo ? `
            <p>Você foi <strong>adicionado</strong> à clínica <strong>${clinicaNome}</strong> no SmartDoc.</p>
            
            <p>Agora você pode:</p>
            <ul>
              <li>Acessar os pacientes da clínica</li>
              <li>Gerenciar consultas e agenda</li>
              <li>Alternar entre suas clínicas na interface</li>
            </ul>
            
            <p>Faça login no SmartDoc para começar a trabalhar com a nova clínica.</p>
          ` : `
            <p>Seu vínculo com a clínica <strong>${clinicaNome}</strong> foi <strong>removido</strong>.</p>
            
            <p>Você não terá mais acesso aos dados desta clínica, mas pode continuar 
               acessando suas outras clínicas normalmente.</p>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar SmartDoc
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático do SmartDoc.
          </p>
        </div>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-medico-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);