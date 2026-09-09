const crypto = require('crypto');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = String(stored).split(':');

    if (!salt || !hash) {
        return false;
    }

    const calculated = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(hash, 'hex');

    if (calculated.length !== original.length) {
        return false;
    }

    return crypto.timingSafeEqual(calculated, original);
}

function base64url(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function signToken(payload) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado no .env');
    }

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const body = {
        ...payload,
        iat: now,
        exp: now + (8 * 60 * 60)
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedBody = base64url(JSON.stringify(body));
    const content = `${encodedHeader}.${encodedBody}`;

    const signature = crypto
        .createHmac('sha256', secret)
        .update(content)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${content}.${signature}`;
}

function verifyToken(token) {
    const secret = process.env.JWT_SECRET;

    if (!secret || !token) {
        return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
        return null;
    }

    const [header, body, signature] = parts;
    const content = `${header}.${body}`;

    const expected = crypto
        .createHmac('sha256', secret)
        .update(content)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (signature.length !== expected.length) {
        return null;
    }

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return null;
    }

    const normalized = body.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - normalized.length % 4) % 4);
    const payload = JSON.parse(Buffer.from(normalized + padding, 'base64').toString('utf8'));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }

    return payload;
}

module.exports = {
    hashPassword,
    verifyPassword,
    signToken,
    verifyToken
};
