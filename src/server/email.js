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
    console.log('Attempting to send welcome email to:', toEmail);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Skipping welcome email.');
        console.warn('Required environment variables: EMAIL_USER, EMAIL_PASS');
        return { success: false, reason: 'Email credentials not configured' };
    }

    try {
        const mailOptions = {
            from: `"EchoNote" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to EchoNote! 🚀',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1128; background-color: #ffffff; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; font-size: 32px; margin-bottom: 10px;">Welcome aboard, ${userName}!</h1>
                        <p style="font-size: 18px; color: #6b7280;">We're thrilled to have you at <strong style="color: #7c3aed;">EchoNote</strong></p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
                        <h2 style="margin: 0 0 15px 0; font-size: 24px;">🎯 Your AI-Powered Meeting Assistant</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Transform your meetings into actionable intelligence</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                        Get ready to revolutionize how you handle meetings. With EchoNote, you'll never have to worry about missing a detail again.
                    </p>
                    
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #7c3aed;">
                        <h3 style="margin-top: 0; color: #1a1128; font-size: 20px;">🚀 What's next?</h3>
                        <ul style="padding-left: 20px; line-height: 1.8;">
                            <li style="margin-bottom: 10px;"><strong>Start recording:</strong> Begin your first real-time meeting transcription</li>
                            <li style="margin-bottom: 10px;"><strong>Upload audio:</strong> Process existing recordings for instant insights</li>
                            <li style="margin-bottom: 10px;"><strong>Connect calendar:</strong> Enable automated meeting joins and scheduling</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://your-domain.com'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            Go to Dashboard →
                        </a>
                    </div>

                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                        If you have any questions, just reply to this email. Our team is here to help you succeed!
                    </p>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1128;">Best regards,<br>The EchoNote Team</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EchoNote. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully to:', toEmail);
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email to:', toEmail);
        console.error('Error details:', error.message);
        
        // Don't throw the error, return error info instead
        return { 
            success: false, 
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        };
    }
}

module.exports = {
    sendWelcomeEmail
};
