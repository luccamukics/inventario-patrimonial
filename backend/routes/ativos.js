const express = require('express');
const pool = require('../database');
const { autenticar, permitirPerfis } = require('../middleware/auth');
const { registrarHistorico } = require('../utils/auditoria');

const router = express.Router();

router.use(autenticar);

const SELECT_BASE = `
    SELECT
        a.serial_number,
        a.patrimonio,
        a.tipo,
        a.marca,
        a.modelo,
        a.status_ativo,
        a.data_cadastro,
        a.data_atualizacao,
        a.ativo,
        a.motivo_baixa,
        a.setor_id,
        a.categoria_id,
        s.nome AS setor,
        p.id AS predio_id,
        p.nome AS predio,
        c.id AS campus_id,
        c.nome AS campus,
        cat.nome AS categoria
    FROM ativos a
    INNER JOIN setores s ON a.setor_id = s.id
    INNER JOIN predios p ON s.predio_id = p.id
    INNER JOIN campus c ON p.campus_id = c.id
    LEFT JOIN categorias cat ON a.categoria_id = cat.id
`;

router.get('/export/csv', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            ${SELECT_BASE}
            ORDER BY a.patrimonio
        `);

        const cabecalho = [
            'serial_number',
            'patrimonio',
            'tipo',
            'marca',
            'modelo',
            'status',
            'categoria',
            'setor',
            'predio',
            'campus',
            'ativo'
        ];

        const escapeCsv = value => {
            const text = value == null ? '' : String(value);
            return `"${text.replace(/"/g, '""')}"`;
        };

        const linhas = [
            cabecalho.join(';'),
            ...rows.map(row => [
                row.serial_number,
                row.patrimonio,
                row.tipo,
                row.marca,
                row.modelo,
                row.status_ativo,
                row.categoria,
                row.setor,
                row.predio,
                row.campus,
                row.ativo ? 'Sim' : 'Não'
            ].map(escapeCsv).join(';'))
        ];

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="inventario.csv"');
        res.send('\uFEFF' + linhas.join('\n'));

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao exportar CSV'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const {
            q = '',
            status = '',
            campus_id = '',
            predio_id = '',
            setor_id = '',
            tipo = '',
            incluir_baixados = '0'
        } = req.query;

        const filtros = [];
        const params = [];

        if (incluir_baixados !== '1') {
            filtros.push('a.ativo = 1');
        }

        if (q) {
            filtros.push(`(
                a.serial_number LIKE ?
                OR a.patrimonio LIKE ?
                OR a.marca LIKE ?
                OR a.modelo LIKE ?
            )`);

            const termo = `%${q}%`;
            params.push(termo, termo, termo, termo);
        }

        if (status) {
            filtros.push('a.status_ativo = ?');
            params.push(status);
        }

        if (campus_id) {
            filtros.push('c.id = ?');
            params.push(campus_id);
        }

        if (predio_id) {
            filtros.push('p.id = ?');
            params.push(predio_id);
        }

        if (setor_id) {
            filtros.push('s.id = ?');
            params.push(setor_id);
        }

        if (tipo) {
            filtros.push('a.tipo = ?');
            params.push(tipo);
        }

        const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

        const [ativos] = await pool.query(`
            ${SELECT_BASE}
            ${where}
            ORDER BY a.patrimonio, a.serial_number
        `, params);

        res.json(ativos);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao buscar ativos'
        });
    }
});

router.get('/:serial/historico', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                h.id,
                h.data_hora,
                h.evento,
                h.dados_antes,
                h.dados_depois,
                h.motivo,
                u.nome AS usuario
            FROM historico_ativos h
            INNER JOIN usuarios u ON h.usuario_id = u.id
            WHERE h.ativo_serial = ?
            ORDER BY h.data_hora DESC
        `, [req.params.serial]);

        res.json(rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao buscar histórico'
        });
    }
});

router.get('/:serial', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            ${SELECT_BASE}
            WHERE a.serial_number = ?
            LIMIT 1
        `, [req.params.serial]);

        if (!rows.length) {
            return res.status(404).json({
                mensagem: 'Ativo não encontrado'
            });
        }

        res.json(rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao buscar ativo'
        });
    }
});

router.post(
    '/',
    permitirPerfis('ADMIN', 'GESTOR'),
    async (req, res) => {
        const connection = await pool.getConnection();

        try {
            const {
                serial_number,
                patrimonio,
                tipo,
                marca,
                modelo,
                status_ativo = 'Disponivel',
                setor_id,
                categoria_id = null
            } = req.body;

            if (!serial_number || !patrimonio || !tipo || !marca || !modelo || !setor_id) {
                return res.status(400).json({
                    mensagem: 'Preencha serial, patrimônio, tipo, marca, modelo e setor'
                });
            }

            await connection.beginTransaction();

            await connection.query(`
                INSERT INTO ativos
                (serial_number, patrimonio, tipo, marca, modelo, status_ativo, setor_id, categoria_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                serial_number,
                patrimonio,
                tipo,
                marca,
                modelo,
                status_ativo,
                setor_id,
                categoria_id || null
            ]);

            const [novoAtivo] = await connection.query(
                'SELECT * FROM ativos WHERE serial_number = ?',
                [serial_number]
            );

            await registrarHistorico(connection, {
                ativoSerial: serial_number,
                usuarioId: req.usuario.id,
                evento: 'CADASTRO',
                depois: novoAtivo[0]
            });

            await connection.commit();

            res.status(201).json({
                mensagem: 'Ativo cadastrado com sucesso'
            });

        } catch (erro) {
            await connection.rollback();
            console.error(erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    mensagem: 'Serial ou patrimônio já cadastrado'
                });
            }

            res.status(500).json({
                mensagem: 'Erro ao cadastrar ativo'
            });

        } finally {
            connection.release();
        }
    }
);

router.put(
    '/:serial',
    permitirPerfis('ADMIN', 'GESTOR'),
    async (req, res) => {
        const connection = await pool.getConnection();

        try {
            const [atuais] = await connection.query(
                'SELECT * FROM ativos WHERE serial_number = ? LIMIT 1',
                [req.params.serial]
            );

            if (!atuais.length) {
                return res.status(404).json({
                    mensagem: 'Ativo não encontrado'
                });
            }

            const antes = atuais[0];

            const {
                patrimonio = antes.patrimonio,
                tipo = antes.tipo,
                marca = antes.marca,
                modelo = antes.modelo,
                status_ativo = antes.status_ativo,
                setor_id = antes.setor_id,
                categoria_id = antes.categoria_id
            } = req.body;

            await connection.beginTransaction();

            await connection.query(`
                UPDATE ativos
                SET patrimonio = ?,
                    tipo = ?,
                    marca = ?,
                    modelo = ?,
                    status_ativo = ?,
                    setor_id = ?,
                    categoria_id = ?,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE serial_number = ?
            `, [
                patrimonio,
                tipo,
                marca,
                modelo,
                status_ativo,
                setor_id,
                categoria_id || null,
                req.params.serial
            ]);

            const [atualizados] = await connection.query(
                'SELECT * FROM ativos WHERE serial_number = ? LIMIT 1',
                [req.params.serial]
            );

            await registrarHistorico(connection, {
                ativoSerial: req.params.serial,
                usuarioId: req.usuario.id,
                evento: 'ALTERACAO',
                antes,
                depois: atualizados[0]
            });

            await connection.commit();

            res.json({
                mensagem: 'Ativo atualizado com sucesso'
            });

        } catch (erro) {
            await connection.rollback();
            console.error(erro);
            res.status(500).json({
                mensagem: 'Erro ao atualizar ativo'
            });

        } finally {
            connection.release();
        }
    }
);

router.delete(
    '/:serial',
    permitirPerfis('ADMIN', 'GESTOR'),
    async (req, res) => {
        const connection = await pool.getConnection();

        try {
            const { motivo } = req.body;

            if (!motivo) {
                return res.status(400).json({
                    mensagem: 'Informe o motivo da baixa'
                });
            }

            const [atuais] = await connection.query(
                'SELECT * FROM ativos WHERE serial_number = ? LIMIT 1',
                [req.params.serial]
            );

            if (!atuais.length) {
                return res.status(404).json({
                    mensagem: 'Ativo não encontrado'
                });
            }

            const antes = atuais[0];

            await connection.beginTransaction();

            await connection.query(`
                UPDATE ativos
                SET ativo = 0,
                    status_ativo = 'Baixado',
                    motivo_baixa = ?,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE serial_number = ?
            `, [motivo, req.params.serial]);

            const [depois] = await connection.query(
                'SELECT * FROM ativos WHERE serial_number = ? LIMIT 1',
                [req.params.serial]
            );

            await registrarHistorico(connection, {
                ativoSerial: req.params.serial,
                usuarioId: req.usuario.id,
                evento: 'BAIXA',
                antes,
                depois: depois[0],
                motivo
            });

            await connection.commit();

            res.json({
                mensagem: 'Baixa registrada com sucesso'
            });

        } catch (erro) {
            await connection.rollback();
            console.error(erro);
            res.status(500).json({
                mensagem: 'Erro ao registrar baixa'
            });

        } finally {
            connection.release();
        }
    }
);

module.exports = router;
