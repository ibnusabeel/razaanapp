const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

console.log('--- LINE API Diagnostic ---');
console.log('Token Length:', LINE_CHANNEL_ACCESS_TOKEN ? LINE_CHANNEL_ACCESS_TOKEN.length : 'Missing');
console.log('User ID:', LINE_USER_ID || 'Missing');

if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) {
    console.error('❌ Missing environment variables.');
    process.exit(1);
}

async function testLineMessage() {
    try {
        console.log('Attempting to send test message...');
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: LINE_USER_ID,
                messages: [
                    {
                        type: 'text',
                        text: 'Test message from Razaan Order System diagnostic script',
                    },
                ],
            }),
        });

        if (response.ok) {
            console.log('✅ LINE Message sent successfully!');
        } else {
            const error = await response.json();
            console.error('❌ Failed to send message.');
            console.error('Status:', response.status);
            console.error('Error Details:', JSON.stringify(error, null, 2));
        }
    } catch (error) {
        console.error('❌ Network or execution error:', error.message);
    }
}

testLineMessage();
