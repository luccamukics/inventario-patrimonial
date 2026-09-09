# Inventário Patrimonial

Aplicação web desenvolvida para gerenciamento e rastreabilidade de ativos patrimoniais.

O sistema permite cadastrar, consultar, editar e realizar a baixa lógica de ativos, mantendo o histórico das alterações realizadas. Também possui autenticação de usuários, dashboard e exportação dos dados para CSV.

## Tecnologias utilizadas

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express
- mysql2
- dotenv

### Banco de dados
- MySQL
- MySQL Workbench

### Controle de versão
- Git
- GitHub

## Funcionalidades

- Autenticação de usuários
- Controle de acesso por perfil
- Dashboard de ativos
- Cadastro de ativos patrimoniais
- Consulta e pesquisa de ativos
- Filtro por status
- Edição de ativos
- Organização por campus, prédio e setor
- Categorização de ativos
- Baixa lógica de ativos
- Histórico e auditoria das alterações
- Exportação de dados para CSV

## Estrutura do projeto

```text
inventario-patrimonial-entrega/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
│
├── database/
│   ├── schema_completo.sql
│   └── upgrade_banco_atual.sql
│
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- npm
- MySQL Server
- MySQL Workbench ou outro cliente MySQL

## Configuração do banco de dados

Crie o banco de dados utilizando o script disponível em:

```text
database/schema_completo.sql
```

O script cria as tabelas necessárias para funcionamento da aplicação.

## Configuração do backend

Abra um terminal na pasta:

```text
backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` dentro da pasta `backend`.

Utilize o arquivo `.env.example` como referência e informe os dados da sua instalação do MySQL.

Exemplo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=inventario_patrimonial
PORT=3000
JWT_SECRET=altere_esta_chave
```

> O arquivo `.env` não deve ser enviado ao GitHub, pois pode conter informações sensíveis.

Crie o usuário administrador inicial:

```bash
npm run create-admin
```

Depois, inicie a API:

```bash
npm start
```

O backend ficará disponível em:

```text
http://localhost:3000
```

## Configuração do frontend

Abra outro terminal e acesse a pasta:

```text
frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

A aplicação ficará disponível, por padrão, em:

```text
http://localhost:5173
```

## Acesso inicial

Após executar o script de criação do administrador:

```text
E-mail: admin@inventario.local
Senha: admin123
```

Recomenda-se alterar as credenciais padrão em ambientes reais.

## Executando o sistema

Para utilizar a aplicação, mantenha dois terminais abertos:

**Terminal 1 — Backend**

```bash
cd backend
npm start
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Depois, acesse no navegador:

```text
http://localhost:5173
```

## Arquitetura

A aplicação utiliza uma arquitetura dividida em três partes principais:

```text
React
  ↓
API REST - Node.js + Express
  ↓
MySQL
```

O frontend realiza requisições HTTP para a API. O backend processa as regras da aplicação e realiza as operações no banco de dados MySQL.

## Segurança

O projeto utiliza:

- Hash de senha
- Token de autenticação
- Variáveis de ambiente
- Controle de acesso por perfil
- `.gitignore` para impedir o versionamento do arquivo `.env`

## Auditoria e rastreabilidade

As alterações realizadas nos ativos são registradas no histórico do sistema.

A baixa de um ativo é realizada de forma lógica. Dessa maneira, o registro não é excluído definitivamente do banco de dados, preservando seu histórico e permitindo maior rastreabilidade das informações.

## Autor

**Lucca Mukics**

Projeto desenvolvido como atividade acadêmica na área de desenvolvimento web.
