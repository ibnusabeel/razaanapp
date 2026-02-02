const mongoose = require('mongoose');

// Connection string from .env.local
const uri = "mongodb+srv://ibnusabeel8_db_user:hudaAideel51265@sunnahthai.q3ijtp9.mongodb.net/razaan";

console.log('Testing MongoDB connection...');
console.log('URI:', uri);

async function testConnection() {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connection Successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
