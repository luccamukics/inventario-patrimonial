USE inventario_patrimonial;

-- Este script considera que campus, predios, setores e ativos já existem,
-- e que ativos já possui setor_id.

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('ADMIN', 'GESTOR', 'CONSULTOR') NOT NULL DEFAULT 'CONSULTOR',
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Execute este bloco uma única vez no banco atual.
ALTER TABLE ativos
    ADD COLUMN categoria_id INT NULL,
    ADD COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN motivo_baixa VARCHAR(255) NULL,
    ADD COLUMN data_atualizacao DATETIME NULL,
    ADD CONSTRAINT fk_ativos_categorias
        FOREIGN KEY (categoria_id) REFERENCES categorias(id);

CREATE TABLE IF NOT EXISTS historico_ativos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ativo_serial VARCHAR(20) NOT NULL,
    usuario_id INT NOT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evento VARCHAR(30) NOT NULL,
    dados_antes JSON NULL,
    dados_depois JSON NULL,
    motivo VARCHAR(255) NULL,
    CONSTRAINT fk_historico_ativo
        FOREIGN KEY (ativo_serial) REFERENCES ativos(serial_number),
    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

INSERT IGNORE INTO categorias (nome, descricao) VALUES
('Notebook', 'Computadores portáteis'),
('Desktop', 'Computadores de mesa'),
('Monitor', 'Monitores'),
('Celular', 'Dispositivos móveis'),
('Periférico', 'Teclados, mouses e outros periféricos');

-- Depois que confirmar que setor_id está preenchido em todos os ativos:
-- ALTER TABLE ativos MODIFY COLUMN setor_id INT NOT NULL;

-- As colunas antigas abaixo ficaram redundantes após a normalização.
-- Só remova depois de conferir os dados.
-- ALTER TABLE ativos DROP COLUMN predio, DROP COLUMN setor, DROP COLUMN campus;
