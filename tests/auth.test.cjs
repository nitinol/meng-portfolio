const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const path = require('node:path');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');

const root = path.resolve(__dirname, '..');

// ---- dependency stubs (no node_modules needed for contract tests) ----
const usersStore = new Map();
const fakeCollection = {
    async findOne(query) {
        if (query.email) return usersStore.get(query.email) || null;
        if (query._id) {
            for (const user of usersStore.values()) {
                if (user._id && user._id.toString() === query._id.toString()) return user;
            }
        }
        return null;
    },
    async insertOne(doc) {
        const id = `user_${usersStore.size + 1}`;
        usersStore.set(doc.email, { ...doc, _id: { toString: () => id } });
        return { insertedId: { toString: () => id } };
    }
};
const fakeJwt = {
    sign: (payload) => `token:${payload.email}`,
    verify: (token) => {
        if (!token.startsWith('token:')) throw new Error('bad token');
        return { id: 'user_1', email: token.slice(6) };
    }
};
const fakeBcrypt = {
    hash: async (pw) => `hashed:${pw}`,
    compare: async (pw, hash) => hash === `hashed:${pw}`
};
function FakeObjectId(id) { this.id = id; this.toString = () => id; }

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === 'jsonwebtoken') return fakeJwt;
    if (request === 'bcryptjs') return fakeBcrypt;
    if (request === 'mongodb') {
        if (parent && parent.filename && parent.filename.endsWith(path.join('api', '_lib', 'db.js'))) {
            return { MongoClient: function () { this.connect = async () => {}; this.db = () => ({ collection: () => fakeCollection }); } };
        }
        return { ObjectId: FakeObjectId };
    }
    return origLoad.call(this, request, parent, isMain);
};

process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!';
process.env.MONGODB_URI = 'mongodb://test/test';
process.env.MONGODB_DB = 'menguhan_test';

const register = require('../api/auth/register.js');
const login = require('../api/auth/login.js');
const logout = require('../api/auth/logout.js');
const me = require('../api/auth/me.js');
const { validateEmail, validatePassword, validateName } = require('../api/_lib/validate.js');
const { describeDbError } = require('../api/_lib/auth.js');

function req(method, body, cookie) {
    return {
        method,
        headers: cookie ? { cookie } : {},
        on(event, handler) {
            if (event === 'data') handler(JSON.stringify(body));
            if (event === 'end') handler();
        }
    };
}

function res() {
    const r = { statusCode: 200, headers: {}, body: null };
    r.status = (code) => { r.statusCode = code; return r; };
    r.json = (obj) => { r.body = obj; return r; };
    r.setHeader = (k, v) => { r.headers[k] = v; };
    return r;
}

test('validation accepts good input and rejects bad input', () => {
    assert.equal(validateEmail('a@b.com'), true);
    assert.equal(validateEmail('nope'), false);
    assert.equal(validatePassword('12345678'), true);
    assert.equal(validatePassword('short'), false);
    assert.equal(validateName('Menguhan'), true);
    assert.equal(validateName('  '), false);
});

test('db errors translate to safe actionable messages', () => {
    assert.match(describeDbError({ message: 'bad auth : authentication failed' }), /password/);
    assert.match(describeDbError({ name: 'MongoServerSelectionError', message: 'connection timed out' }), /running/);
    assert.match(describeDbError({ message: 'Invalid scheme, expected connection string to start with "mongodb://"' }), /malformed/);
    assert.equal(describeDbError(new Error('weird')), null);
});

test('register validates, refuses duplicates, creates users', async () => {
    let r = res();
    await register(req('POST', { name: '', email: 'a@b.com', password: '12345678' }), r);
    assert.equal(r.statusCode, 400);
    r = res();
    await register(req('POST', { name: 'M', email: 'bad', password: '12345678' }), r);
    assert.equal(r.statusCode, 400);
    r = res();
    await register(req('POST', { name: 'M', email: 'm@x.com', password: 'short' }), r);
    assert.equal(r.statusCode, 400);
    r = res();
    await register(req('POST', { name: 'Menguhan', email: 'm@x.com', password: '12345678' }), r);
    assert.equal(r.statusCode, 201);
    assert.equal(r.body.email, 'm@x.com');
    assert.ok(!('passHash' in r.body), 'hash never leaks');
    assert.match(r.headers['Set-Cookie'], /HttpOnly/);
    r = res();
    await register(req('POST', { name: 'Other', email: 'M@X.COM', password: '12345678' }), r);
    assert.equal(r.statusCode, 409);
    r = res();
    await register(req('GET', {}), r);
    assert.equal(r.statusCode, 405);
});

test('login uses one message for unknown email and wrong password', async () => {
    let r = res();
    await login(req('POST', { email: 'ghost@x.com', password: '12345678' }), r);
    assert.equal(r.statusCode, 401);
    const unknownMsg = r.body.error;
    r = res();
    await login(req('POST', { email: 'm@x.com', password: 'wrongpass1' }), r);
    assert.equal(r.statusCode, 401);
    assert.equal(r.body.error, unknownMsg);
    r = res();
    await login(req('POST', { email: 'm@x.com', password: '12345678' }), r);
    assert.equal(r.statusCode, 200);
    assert.equal(r.body.name, 'Menguhan');
    assert.match(r.headers['Set-Cookie'], /session=token%3Am%40x\.com/);
});

test('me and logout guard the session', async () => {
    let r = res();
    await me(req('GET', null), r);
    assert.equal(r.statusCode, 401);
    r = res();
    await me(req('GET', null, 'session=token:m@x.com'), r);
    assert.equal(r.statusCode, 200);
    assert.equal(r.body.email, 'm@x.com');
    r = res();
    await logout(req('POST', {}), r);
    assert.equal(r.statusCode, 200);
    assert.match(r.headers['Set-Cookie'], /Max-Age=0/);
});

test('account UI degrades to coming-soon offline, login when signed out', () => {
    function fakeDom() {
        const els = {};
        function el(id) {
            return (els[id] ||= {
                hidden: true, textContent: '', value: '',
                handlers: {},
                addEventListener(name, h) { this.handlers[name] = h; },
                reset() {}
            });
        }
        return {
            getElementById: el,
            __shown() { return Object.keys(els).filter((k) => k.startsWith('auth') && els[k].hidden === false); }
        };
    }
    function run(fetchImpl) {
        const document = fakeDom();
        const window = {};
        vm.runInNewContext(readFileSync(path.join(root, 'auth-ui.js'), 'utf8'), { document, window, fetch: fetchImpl });
        return new Promise((resolve) => setTimeout(() => resolve(document.__shown()), 20));
    }
    const soon = run(() => Promise.reject(new Error('offline')));
    const loginView = run(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) }));
    return Promise.all([soon, loginView]).then(([s, l]) => {
        assert.deepEqual(s, ['authSoon']);
        assert.deepEqual(l, ['authLogin']);
    });
});
