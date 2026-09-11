const bcrypt = require('bcryptjs');
const { db } = require('../_lib/db');
const { readJson, signToken, setSession, describeDbError, validateEmail } = require('../_lib/auth');

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
