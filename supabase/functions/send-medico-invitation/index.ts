import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  to: string;
  nome: string;
  clinicaNome: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('send-medico-invitation function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, nome, clinicaNome, token }: InvitationRequest = await req.json();
    console.log('Sending invitation to:', to);

    const inviteUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token}&type=invite`;

    const emailResponse = await resend.emails.send({
      from: "SmartDoc <onboarding@resend.dev>",
      to: [to],
      subject: `Convite para trabalhar na ${clinicaNome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Convite para SmartDoc</h1>
          
          <p>Olá <strong>${nome}</strong>,</p>
          
          <p>Você foi convidado(a) para trabalhar na clínica <strong>${clinicaNome}</strong> através da plataforma SmartDoc.</p>
          
          <p>Para aceitar o convite e criar sua conta, clique no botão abaixo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Aceitar Convite
            </a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #6b7280;">${inviteUrl}</p>
          
          <p>Este convite expira em 7 dias.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático do SmartDoc. Se você não esperava receber este convite, 
            pode ignorar este email.
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-medico-invitation function:", error);
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