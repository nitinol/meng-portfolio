// Fixed-window rate limiting backed by MongoDB (works across all
// serverless instances, unlike in-memory counters). Callers MUST wrap
// checkLimit in try/catch and continue on limiter failure (fail open) —
// the endpoint's own logic still validates and errors safely.
const { db } = require('./db');

let indexEnsured = false;

async function rateCollection() {
    const database = await db();
    const collection = database.collection('rate_limits');
    if (!indexEnsured) {
        try {
            await collection.createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 });
            indexEnsured = true;
        } catch (e) { /* index races are harmless */ }
    }
    return collection;
}

function clientIp(req) {
    const forwarded = req.headers && req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
        return forwarded.split(',')[0].trim();
    }
    if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
    return 'unknown';
}

// Returns true when the attempt is allowed. Throws when the store is
// unreachable — callers treat that as "limiter unavailable, continue".
async function checkLimit(collection, key, max, windowMs) {
    const now = Date.now();
    const doc = await collection.findOne({ _id: key });
    if (!doc || doc.resetAt < now) {
        await collection.updateOne(
            { _id: key },
            { $set: { count: 1, resetAt: now + windowMs } },
            { upsert: true }
        );
        return true;
    }
    if (doc.count >= max) return false;
    await collection.updateOne({ _id: key }, { $inc: { count: 1 } });
    return true;
}

module.exports = { rateCollection, clientIp, checkLimit };
