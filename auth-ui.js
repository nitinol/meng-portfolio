// Account UI: login / register / session views inside the top-right dialog.
// Progressive enhancement: if the API is unreachable (not yet deployed),
// the dialog keeps its "Coming soon." note. No backend calls on load fail.
(function () {
    var dlg = document.getElementById('accountDialog');
    if (!dlg) return;

    var views = {
        soon: document.getElementById('authSoon'),
        login: document.getElementById('authLogin'),
        register: document.getElementById('authRegister'),
        forgot: document.getElementById('authForgot'),
        account: document.getElementById('authAccount')
    };
    var avatar = document.getElementById('accountAvatar');

    function show(name) {
        Object.keys(views).forEach(function (key) {
            if (views[key]) views[key].hidden = (key !== name);
        });
    }

    function apiError(res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
            throw new Error(data.error || 'Something went wrong.');
        });
    }

    function get(path) {
        return fetch(path, { headers: { Accept: 'application/json' } }).then(function (res) {
            if (res.status === 401) {
                var err = new Error('signed-out');
                err.signedOut = true;
                throw err;
            }
            if (!res.ok) return apiError(res);
            return res.json();
        });
    }

    function post(path, body) {
        return fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body)
        }).then(function (res) {
            if (!res.ok) return apiError(res);
            return res.json();
        });
    }

    function fieldError(el, message) {
        el.textContent = '⚠ ' + message;
        el.hidden = false;
    }

    function showAccount(me) {
        document.getElementById('authName').textContent = me.name;
        document.getElementById('authEmail').textContent = me.email;
        if (avatar) avatar.textContent = (me.name || me.email || '?').trim().charAt(0).toUpperCase();
        show('account');
    }

    function refresh() {
        get('/api/auth/me').then(showAccount).catch(function (e) {
            if (e.signedOut) { show('login'); return; }
            // Network failure = API not deployed yet: keep "Coming soon."
            show('soon');
        });
    }

    document.getElementById('showRegister').addEventListener('click', function () { show('register'); });
    document.getElementById('showLogin').addEventListener('click', function () { show('login'); });
    document.getElementById('showForgot').addEventListener('click', function () { show('forgot'); });
    document.getElementById('backToLogin').addEventListener('click', function () { show('login'); });
    document.getElementById('backToLogin2').addEventListener('click', function () { show('login'); });

    views.login.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = document.getElementById('loginError');
        err.hidden = true;
        post('/api/auth/login', {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPass').value
        }).then(showAccount).catch(function (ex) { fieldError(err, ex.message); });
    });

    views.register.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = document.getElementById('registerError');
        err.hidden = true;
        post('/api/auth/register', {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPass').value
        }).then(showAccount).catch(function (ex) { fieldError(err, ex.message); });
    });

    document.getElementById('logoutBtn').addEventListener('click', function () {
        post('/api/auth/logout', {}).then(function () {
            if (avatar) avatar.textContent = '○';
            views.login.reset();
            show('login');
        });
    });

    refresh();
})();
