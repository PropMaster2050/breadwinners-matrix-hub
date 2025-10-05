import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DownlineNotificationRequest {
  sponsorEmail: string;
  sponsorName: string;
  newMemberName: string;
  newMemberId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sponsorEmail, sponsorName, newMemberName, newMemberId }: DownlineNotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Breadwinners Family Society <onboarding@resend.dev>",
      to: [sponsorEmail],
      subject: "🎉 New Member Joined Your Network!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #003d82, #0052a3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .member-info { background: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            h1 { margin: 0; font-size: 28px; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: bold; color: #0052a3; }
            .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Great News!</h1>
            </div>
            <div class="content">
              <p>Dear ${sponsorName},</p>
              
              <div class="celebration">🌟</div>
              
              <p><strong>Congratulations!</strong> A new member has just joined your network in Breadwinners Family Society.</p>
              
              <div class="member-info">
                <h3 style="margin-top: 0; color: #28a745;">New Team Member Details</h3>
                <div class="info-item">
                  <span class="info-label">Member Name:</span> ${newMemberName}
                </div>
                <div class="info-item">
                  <span class="info-label">Member ID:</span> ${newMemberId}
                </div>
              </div>
              
              <p><strong>What This Means for You:</strong></p>
              <ul>
                <li>Your network is growing stronger</li>
                <li>You're one step closer to completing your stages</li>
                <li>Your earning potential is increasing</li>
                <li>You're helping empower another South African financially</li>
              </ul>
              
              <p style="margin-top: 30px;"><strong>Next Steps:</strong></p>
              <ol>
                <li>Login to your dashboard to see the updated network tree</li>
                <li>Welcome your new team member</li>
                <li>Guide them on their journey to success</li>
              </ol>
              
              <p style="margin-top: 30px;">Keep up the excellent work! Your dedication to building a strong network is making a difference.</p>
              
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

    console.log("Downline notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending downline notification:", error);
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
