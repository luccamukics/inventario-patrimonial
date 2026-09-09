const express = require('express');
const pool = require('../database');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
    try {
        const [[totais]] = await pool.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos,
                SUM(CASE WHEN status_ativo = 'Disponivel' AND ativo = 1 THEN 1 ELSE 0 END) AS disponiveis,
                SUM(CASE WHEN status_ativo = 'Em uso' AND ativo = 1 THEN 1 ELSE 0 END) AS em_uso,
                SUM(CASE WHEN status_ativo = 'Manutencao' AND ativo = 1 THEN 1 ELSE 0 END) AS manutencao,
                SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) AS baixados
            FROM ativos
        `);

        const [porTipo] = await pool.query(`
            SELECT tipo, COUNT(*) AS quantidade
            FROM ativos
            WHERE ativo = 1
            GROUP BY tipo
            ORDER BY quantidade DESC, tipo
        `);

        const [porCampus] = await pool.query(`
            SELECT c.nome AS campus, COUNT(*) AS quantidade
            FROM ativos a
            INNER JOIN setores s ON a.setor_id = s.id
            INNER JOIN predios p ON s.predio_id = p.id
            INNER JOIN campus c ON p.campus_id = c.id
            WHERE a.ativo = 1
            GROUP BY c.id, c.nome
            ORDER BY quantidade DESC, campus
        `);

        res.json({
            totais,
            porTipo,
            porCampus
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao carregar dashboard'
        });
    }
});

module.exports = router;
