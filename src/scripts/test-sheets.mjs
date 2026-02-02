import { google } from 'googleapis';

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('--- Google Sheets Diagnostic ---');
console.log('Sheet ID:', GOOGLE_SHEETS_ID ? 'Set' : 'Missing');
console.log('Service Account:', GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('Private Key:', GOOGLE_PRIVATE_KEY ? 'Set (Length: ' + GOOGLE_PRIVATE_KEY.length + ')' : 'Missing');

if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error('❌ Missing environment variables.');
    process.exit(1);
}

async function testConnection() {
    try {
        console.log('Authenticating...');
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log('Attempting to read metadata...');
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId: GOOGLE_SHEETS_ID,
        });
        console.log('✅ Connection successful! Sheet Title:', metadata.data.properties.title);

        console.log('Available Sheets:');
        metadata.data.sheets.forEach(sheet => {
            console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
        });

        const firstSheetName = metadata.data.sheets[0].properties.title;
        console.log(`Attempting to append test row to first sheet: '${firstSheetName}'...`);

        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEETS_ID,
            range: `'${firstSheetName}'!A:A`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['Test Connection', new Date().toISOString()]],
            },
        });
        console.log('✅ Write successful!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testConnection();
