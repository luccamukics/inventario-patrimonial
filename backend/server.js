const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ativosRoutes = require('./routes/ativos');
const cadastrosRoutes = require('./routes/cadastros');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        sistema: 'Inventário Patrimonial',
        api: 'funcionando'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/ativos', ativosRoutes);
app.use('/api/cadastros', cadastrosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
    res.status(404).json({
        mensagem: 'Rota não encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
