const express = require('express'); //Importa o Express instalado

const app = express(); // Aplicacao criada, app passa a representar o servidor Express.

const PORT = 3000; // Porta definida, o servidor ficara esperando requisicoes na porta 3000.

app.get('/', (req, res) => { //get responde a uma requisicao HTTP GET. / representa a rota principal
    res.send('API do Inventário Patrimonial funcionando!');
});

app.get('/ativos', (req, res) => {
    res.send('Lista de ativos');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});