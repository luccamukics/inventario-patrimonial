require('dotenv').config();
const pool = require('../database');
const { hashPassword } = require('../utils/security');

async function main() {
    try {
        const email = process.argv[2] || 'admin@inventario.local';
        const senha = process.argv[3] || 'admin123';
        const nome = process.argv[4] || 'Administrador';

        const senhaHash = hashPassword(senha);

        await pool.query(`
            INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
            VALUES (?, ?, ?, 'ADMIN', 1)
            ON DUPLICATE KEY UPDATE
                nome = VALUES(nome),
                senha_hash = VALUES(senha_hash),
                perfil = 'ADMIN',
                ativo = 1
        `, [nome, email, senhaHash]);

        console.log('Administrador criado/atualizado com sucesso.');
        console.log(`E-mail: ${email}`);
        console.log(`Senha: ${senha}`);

    } catch (erro) {
        console.error('Erro ao criar administrador:', erro.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

main();
