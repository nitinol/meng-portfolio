// Shared auth helpers: JSON parsing, JWT sessions, validation.
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword, validateName } = require('./validate');

const SESSION_DAYS = 30;

function readJson(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(Object.assign(new Error('Invalid request body.'), { status: 400 }));
            }
        });
        req.on('error', reject);
    });
}

function secret() {
    if (!process.env.JWT_SECRET) {
        throw Object.assign(new Error('Auth is not configured.'), { status: 500 });
    }
    return process.env.JWT_SECRET;
}

function signToken(payload) {
    return jwt.sign(payload, secret(), { expiresIn: SESSION_DAYS + 'd' });
}

function sessionUser(req) {
    const header = (req.headers && req.headers.cookie) || '';
    const match = header.match(/(?:^|;\s*)session=([^;]+)/);
    if (!match) return null;
    try {
        return jwt.verify(decodeURIComponent(match[1]), secret());
    } catch (e) {
        return null;
    }
}

function cookieValue(token, maxAge) {
    // Secure only on hosted HTTPS (Vercel sets VERCEL=1); plain HTTP locally.
    const secure = process.env.VERCEL ? '; Secure' : '';
    return `session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function setSession(res, token) {
    res.setHeader('Set-Cookie', cookieValue(token, SESSION_DAYS * 24 * 3600));
}

function clearSession(res) {
    res.setHeader('Set-Cookie', cookieValue('', 0));
}

// Safe diagnostics: naming the failure class without leaking secrets.
function describeDbError(e) {
    const msg = (e && e.message) || '';
    if (/invalid scheme|must start with|parse/i.test(msg)) {
        return 'The connection string looks malformed — it should start with mongodb+srv:// and contain no < > brackets.';
    }
    if (e && (e.code === 8000 || e.code === 18 || /bad auth|authentication failed/i.test(msg))) {
        return 'Database rejected the login — the password in the connection string looks wrong.';
    }
    if (e && (/server selection|timed out|ENOTFOUND|ECONNREFUSED/i.test(e.name + ' ' + msg))) {
        return 'Could not reach the database — is the cluster running and not paused?';
    }
    return null;
}

module.exports = {
    readJson, signToken, sessionUser, setSession, clearSession,
    describeDbError,
    validateEmail, validatePassword, validateName
};
