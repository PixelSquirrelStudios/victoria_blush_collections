'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
}

// Map service values to display names
const serviceNames: Record<string, string> = {
  'cut-finish': 'Cut and Finish',
  blowdry: 'Blow Dry & Styling',
  balayage: 'Full Lived In / Balayage',
  maintenance: 'Maintenance Lived In',
  'full-foils': 'Full Head Foils',
  'half-foils': 'Half Head Foils',
  'global-color': 'Global Colour',
  roots: 'Global Roots',
  toning: 'Toning Service',
  correction: 'Colour Correction',
  treatments: 'Hair Treatments',
  consultation: 'Consultation',
};

export async function sendContactEmail(formData: ContactFormData) {
  try {
    const { name, email, phone, service, message } = formData;

    // Get display name for service
    const serviceName = serviceNames[service] || service;

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error:
          'Email service not configured. Please contact hello@victoriablushcollections.co.uk directly.',
      };
    }

    console.log('Attempting to send email to:', email);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Victoria Blush Collections <hello@victoriablushcollections.co.uk>',
      to: ['hello@victoriablushcollections.co.uk'],
      replyTo: email,
      subject: `New Contact Form Submission - ${serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #2c2f29;
                background-color: #f9faf8;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(44, 47, 41, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #c4cfb4 0%, #b5c4a1 100%);
                padding: 40px 30px;
                text-align: center;
                border-bottom: 3px solid #a8b896;
              }
              .logo {
                display: block;
                max-width: 250px;
                height: auto;
                margin: 0 auto;
              }
              .content {
                padding: 40px 30px;
                background: white;
              }
              .intro {
                margin-bottom: 30px;
                padding: 20px;
                background: #f9faf8;
                border-left: 4px solid #c4cfb4;
                border-radius: 4px;
              }
              .intro p {
                margin: 0;
                color: #4a4d47;
                font-size: 15px;
              }
              .field {
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e8ebe5;
              }
              .field:last-of-type {
                border-bottom: none;
              }
              .label {
                display: block;
                font-weight: 600;
                color: #5d6156;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
              }
              .value {
                color: #2c2f29;
                font-size: 16px;
                line-height: 1.5;
              }
              .value a {
                color: #8a9677;
                text-decoration: none;
                transition: color 0.2s;
              }
              .value a:hover {
                color: #7a8667;
                text-decoration: underline;
              }
              .message-box {
                background: #f9faf8;
                padding: 20px;
                border-radius: 8px;
                color: #2c2f29;
                font-size: 15px;
                line-height: 1.7;
              }
              .footer {
                text-align: center;
                padding: 30px;
                background: #f9faf8;
                border-top: 1px solid #e8ebe5;
              }
              .footer p {
                color: #5d6156;
                font-size: 14px;
                margin: 8px 0;
              }
              .footer a {
                color: #8a9677;
                text-decoration: none;
              }
              @media only screen and (max-width: 600px) {
                body {
                  padding: 10px;
                }
                .header, .content, .footer {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://mfenauruirpaqfynbugx.supabase.co/storage/v1/object/public/images/Victoria%20Blush%20Collections%20Logo.png" alt="Victoria Blush Collections" class="logo" />
              </div>
              
              <div class="content">
                <div class="intro">
                  <p>You have received a new enquiry through your website contact form.</p>
                </div>

                <div class="field">
                  <span class="label">Customer Name</span>
                  <div class="value">${name}</div>
                </div>
                
                <div class="field">
                  <span class="label">Email Address</span>
                  <div class="value">
                    <a href="mailto:${email}">${email}</a>
                  </div>
                </div>
                
                ${
                  phone
                    ? `
                  <div class="field">
                    <span class="label">Phone Number</span>
                    <div class="value">
                      <a href="tel:${phone}">${phone}</a>
                    </div>
                  </div>
                `
                    : ''
                }
                
                <div class="field">
                  <span class="label">Service Interested In</span>
                  <div class="value"><strong>${serviceName}</strong></div>
                </div>
                
                ${
                  message
                    ? `
                  <div class="field">
                    <span class="label">Customer Message</span>
                    <div class="message-box">
                      ${message.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
              
              <div class="footer">
                <p><strong>Victoria Blush Collections</strong></p>
                <p>Bodi Studios, Unit 8, Wilcox House, Cardiff CF11 0BA</p>
                <p>
                  <a href="mailto:hello@victoriablushcollections.co.uk">hello@victoriablushcollections.co.uk</a> • 
                  <a href="tel:07946722683">07946 722 683</a>
                </p>
                <p style="margin-top: 20px; font-size: 12px;">
                  This email was automatically generated from your website contact form.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: `Failed to send email: ${
          error.message || 'Please try again or contact us directly.'
        }`,
      };
    }

    console.log('Email sent successfully:', data);

    return {
      success: true,
      message: "Thank you! I'll get back to you within 24 hours.",
      data,
    };
  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
