// Shared MongoDB connection (cached across warm serverless invocations).
const { MongoClient } = require('mongodb');

let client = null;

async function db() {
    if (!process.env.MONGODB_URI) {
        throw Object.assign(new Error('Database is not configured.'), { status: 500 });
    }
    if (!client) {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
    }
    return client.db(process.env.MONGODB_DB || 'menguhan');
}

module.exports = { db };
