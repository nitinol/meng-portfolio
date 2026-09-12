const bcrypt = require('bcryptjs');
const { db } = require('../_lib/db');
const { readJson, signToken, setSession, describeDbError, validateEmail } = require('../_lib/auth');
const { checkLimit, rateCollection, clientIp } = require('../_lib/ratelimit');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }
    try {
        const { email, password } = await readJson(req);
        if (!validateEmail(email) || typeof password !== 'string') {
            res.status(401).json({ error: 'Email or password is incorrect.' });
            return;
        }
        try {
            const allowed = await checkLimit(await rateCollection(), `login:${clientIp(req)}`, 20, 900000);
            if (!allowed) {
                res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
                return;
            }
        } catch (e) { /* limiter unavailable — continue */ }
        const normalized = email.trim().toLowerCase();
        const users = (await db()).collection('users');
        const user = await users.findOne({ email: normalized });
        // Same message for unknown email: no account enumeration.
        if (!user || !(await bcrypt.compare(password, user.passHash))) {
            res.status(401).json({ error: 'Email or password is incorrect.' });
            return;
        }
        setSession(res, signToken({ id: user._id.toString(), email: user.email }));
        res.status(200).json({ name: user.name, email: user.email });
    } catch (e) {
        res.status(e.status || 500).json({ error: e.status ? e.message : (describeDbError(e) || 'Something went wrong.') });
    }
};
