const express = require('express');
const pool = require('../database');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.use(autenticar);

router.get('/campus', async (req, res) => {
    const [rows] = await pool.query('SELECT id, nome FROM campus ORDER BY nome');
    res.json(rows);
});

router.get('/predios', async (req, res) => {
    const { campus_id } = req.query;

    let sql = 'SELECT id, nome, campus_id FROM predios';
    const params = [];

    if (campus_id) {
        sql += ' WHERE campus_id = ?';
        params.push(campus_id);
    }

    sql += ' ORDER BY nome';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
});

router.get('/setores', async (req, res) => {
    const { predio_id } = req.query;

    let sql = 'SELECT id, nome, predio_id FROM setores';
    const params = [];

    if (predio_id) {
        sql += ' WHERE predio_id = ?';
        params.push(predio_id);
    }

    sql += ' ORDER BY nome';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
});

router.get('/categorias', async (req, res) => {
    const [rows] = await pool.query(
        'SELECT id, nome, descricao FROM categorias WHERE ativo = 1 ORDER BY nome'
    );
    res.json(rows);
});

module.exports = router;
