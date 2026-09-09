const express = require('express');
const pool = require('../database');
const { verifyPassword, signToken } = require('../utils/security');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'E-mail e senha são obrigatórios'
            });
        }

        const [usuarios] = await pool.query(
            `SELECT id, nome, email, senha_hash, perfil, ativo
             FROM usuarios
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        const usuario = usuarios[0];

        if (!usuario || !usuario.ativo || !verifyPassword(senha, usuario.senha_hash)) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos'
            });
        }

        const token = signToken({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao realizar login'
        });
    }
});

module.exports = router;
