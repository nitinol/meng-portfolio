const bcrypt = require('bcryptjs');
const { db } = require('../_lib/db');
const { readJson, signToken, setSession, describeDbError, validateEmail, validatePassword, validateName } = require('../_lib/auth');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }
    try {
        const { name, email, password } = await readJson(req);
        if (!validateName(name)) {
            res.status(400).json({ error: 'Please enter your name.' });
            return;
        }
        if (!validateEmail(email)) {
            res.status(400).json({ error: 'Please enter a valid email address.' });
            return;
        }
        if (!validatePassword(password)) {
            res.status(400).json({ error: 'Password must be at least 8 characters.' });
            return;
        }
        const normalized = email.trim().toLowerCase();
        const users = (await db()).collection('users');
        if (await users.findOne({ email: normalized })) {
            res.status(409).json({ error: 'An account with this email already exists.' });
            return;
        }
        const passHash = await bcrypt.hash(password, 12);
        const result = await users.insertOne({
            name: name.trim(),
            email: normalized,
            passHash,
            createdAt: new Date()
        });
        setSession(res, signToken({ id: result.insertedId.toString(), email: normalized }));
        res.status(201).json({ name: name.trim(), email: normalized });
    } catch (e) {
        res.status(e.status || 500).json({ error: e.status ? e.message : (describeDbError(e) || 'Something went wrong.') });
    }
};
