const emailService = require('./email');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the root
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testConfig() {
    console.log('--- Email Configuration Test ---');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in .env');
        process.exit(1);
    }

    try {
        console.log('Sending test email to', process.env.EMAIL_USER, '...');
        await emailService.sendWelcomeEmail(process.env.EMAIL_USER, 'Test User');
        console.log('✅ SUCCESS: Test email sent successfully! Please check your inbox.');
    } catch (error) {
        console.error('❌ FAILED: Could not send email.');
        console.error('Error Details:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('\n💡 TIP: If using Gmail, make sure you are using an "App Password", not your regular password.');
        }
    }
}

testConfig();
