// Pure input validation — zero dependencies, safe to unit-test anywhere.
function validateEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

function validateName(name) {
    return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 60;
}

module.exports = { validateEmail, validatePassword, validateName };
