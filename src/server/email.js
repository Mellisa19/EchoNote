const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter using environment variables
// For production, use a service like SendGrid, Mailgun, or Gmail with App Password
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendWelcomeEmail(toEmail, userName) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Skipping welcome email.');
        return;
    }

    try {
        const mailOptions = {
            from: `"EchoNote AI" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to EchoNote AI! 🚀',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1128;">
                    <h1 style="color: #7c3aed;">Welcome aboard, ${userName}!</h1>
                    <p>We're thrilled to have you at <strong>EchoNote AI</strong>.</p>
                    <p>Get ready to transform your meetings into actionable intelligence. With our AI-powered platform, you'll never have to worry about missing a detail again.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">What's next?</h3>
                        <ul style="padding-left: 20px;">
                            <li>Start your first real-time meeting recording.</li>
                            <li>Upload an existing audio file for instant transcription.</li>
                            <li>Connect your Google Calendar for automated meeting joins.</li>
                        </ul>
                    </div>

                    <p>If you have any questions, just reply to this email. We're here to help!</p>
                    
                    <p>Best,<br>The EchoNote Team</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">
                        &copy; ${new Date().getFullYear()} EchoNote AI. All rights reserved.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}

module.exports = {
    sendWelcomeEmail
};
