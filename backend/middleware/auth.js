const { verifyToken } = require('../utils/security');

function autenticar(req, res, next) {
    const authorization = req.headers.authorization || '';
    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({
            mensagem: 'Autenticação necessária'
        });
    }

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado'
        });
    }

    req.usuario = payload;
    next();
}

function permitirPerfis(...perfis) {
    return (req, res, next) => {
        if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
            return res.status(403).json({
                mensagem: 'Usuário sem permissão para esta operação'
            });
        }

        next();
    };
}

module.exports = {
    autenticar,
    permitirPerfis
};
