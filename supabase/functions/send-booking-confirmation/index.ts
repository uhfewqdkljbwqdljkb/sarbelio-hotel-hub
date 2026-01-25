import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  guestName: string;
  guestEmail: string;
  confirmationCode: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-confirmation function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid user session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with the user's auth token
    const supabaseClient = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid or expired token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User authenticated:", user.id);

    const booking: BookingConfirmationRequest = await req.json();
    console.log("Booking data received:", booking);

    // Verify the booking exists in the database
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select('*')
      .eq('confirmation_code', booking.confirmationCode)
      .single();

    if (reservationError || !reservation) {
      console.error("Booking not found:", reservationError?.message);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Booking verified:", reservation.id);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8c7a6b 0%, #6b5a4d 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
            .header .check-icon { font-size: 48px; margin-bottom: 15px; }
            .content { padding: 30px; }
            .confirmation-code { background-color: #f8f6f4; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px; }
            .confirmation-code label { display: block; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .confirmation-code span { font-size: 28px; font-weight: bold; color: #8c7a6b; font-family: monospace; letter-spacing: 2px; }
            .details-section { margin-bottom: 25px; }
            .details-section h2 { font-size: 16px; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #666; font-size: 14px; }
            .detail-value { color: #333; font-size: 14px; font-weight: 500; }
            .total-row { background-color: #f8f6f4; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .total-row .detail-label { font-weight: 600; color: #333; }
            .total-row .detail-value { font-size: 20px; color: #8c7a6b; font-weight: bold; }
            .footer { background-color: #f8f6f4; padding: 25px 30px; text-align: center; color: #666; font-size: 13px; }
            .footer a { color: #8c7a6b; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="check-icon">✓</div>
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Dear <strong>${booking.guestName}</strong>,<br><br>
                Thank you for your reservation! Your booking has been confirmed. Please find your booking details below.
              </p>
              
              <div class="confirmation-code">
                <label>Confirmation Code</label>
                <span>${booking.confirmationCode}</span>
              </div>
              
              <div class="details-section">
                <h2>Reservation Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Room</span>
                  <span class="detail-value">${booking.roomName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Room Number</span>
                  <span class="detail-value">${booking.roomNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">${booking.checkIn}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${booking.checkOut}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">${booking.nights} night${booking.nights !== 1 ? 's' : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div class="total-row">
                <div class="detail-row" style="border: none; margin: 0; padding: 0;">
                  <span class="detail-label">Total Amount</span>
                  <span class="detail-value">$${booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>We look forward to welcoming you!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", booking.guestEmail);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bookings <onboarding@resend.dev>",
        to: [booking.guestEmail],
        subject: `Booking Confirmed - ${booking.confirmationCode}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
