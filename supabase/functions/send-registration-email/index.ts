import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  email: string;
  fullName: string;
  username: string;
  password: string;
  memberId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, username, password, memberId }: RegistrationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Breadwinners Family Society <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Breadwinners Family Society! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #003d82, #0052a3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #0052a3; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            h1 { margin: 0; font-size: 28px; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #0052a3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Breadwinners!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>Congratulations! Your registration with Breadwinners Family Society has been successfully completed.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #0052a3;">Your Login Credentials</h3>
                <div class="credential-item">
                  <span class="credential-label">Member ID:</span> ${memberId}
                </div>
                <div class="credential-item">
                  <span class="credential-label">Username:</span> ${username}
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span> ${password}
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                Please keep these credentials safe and secure. We recommend changing your password after your first login for enhanced security.
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Login to your account using the credentials above</li>
                <li>Complete your profile information</li>
                <li>Start building your network</li>
                <li>Explore earning opportunities</li>
              </ol>
              
              <p style="margin-top: 30px;">Thank you for joining our family! Together, we empower South Africans financially.</p>
              
              <p>Best regards,<br><strong>The Breadwinners Family Society Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 Breadwinners Family Society. All rights reserved.</p>
              <p>Empowering South Africans financially</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Registration email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending registration email:", error);
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
