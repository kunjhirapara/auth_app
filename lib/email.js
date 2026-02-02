import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Auth App" <noreply@authapp.com>',
    to: email,
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>This link will expire in 15 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello,
      
      We received a request to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 15 minutes.
      
      If you didn't request this password reset, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
