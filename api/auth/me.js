const { ObjectId } = require('mongodb');
const { db } = require('../_lib/db');
const { sessionUser, describeDbError } = require('../_lib/auth');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }
    try {
        const session = sessionUser(req);
        if (!session) {
            res.status(401).json({ error: 'Not signed in.' });
            return;
        }
        const users = (await db()).collection('users');
        const user = await users.findOne({ _id: new ObjectId(session.id) });
        if (!user) {
            res.status(401).json({ error: 'Not signed in.' });
            return;
        }
        res.status(200).json({ name: user.name, email: user.email });
    } catch (e) {
        res.status(e.status || 500).json({ error: e.status ? e.message : (describeDbError(e) || 'Something went wrong.') });
    }
};
