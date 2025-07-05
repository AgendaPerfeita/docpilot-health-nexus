import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CredentialsRequest {
  to: string;
  nome: string;
  email: string;
  senha: string;
  clinicaNome: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, nome, email, senha, clinicaNome }: CredentialsRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "SmartDoc <onboarding@resend.dev>",
      to: [to],
      subject: `Bem-vindo ao SmartDoc - ${clinicaNome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bem-vindo ao SmartDoc!</h1>
          
          <p>Olá <strong>${nome}</strong>,</p>
          
          <p>Você foi cadastrado como médico na clínica <strong>${clinicaNome}</strong> no sistema SmartDoc.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Suas credenciais de acesso:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha temporária:</strong> <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${senha}</code></p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Importante:</strong> Por favor, altere sua senha no primeiro acesso para garantir a segurança da sua conta.</p>
          </div>
          
          <p>Você pode acessar o sistema através do link: <a href="https://smartdoc.com.br" style="color: #2563eb;">https://smartdoc.com.br</a></p>
          
          <p>Se você tiver alguma dúvida, entre em contato com a administração da clínica <strong>${clinicaNome}</strong>.</p>
          
          <p>Atenciosamente,<br>
          Equipe SmartDoc</p>
        </div>
      `,
    });

    console.log("Credenciais enviadas com sucesso:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar credenciais:", error);
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