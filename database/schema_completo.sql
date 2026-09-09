CREATE DATABASE IF NOT EXISTS inventario_patrimonial
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE inventario_patrimonial;

CREATE TABLE IF NOT EXISTS campus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS predios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    campus_id INT NOT NULL,
    CONSTRAINT fk_predios_campus
        FOREIGN KEY (campus_id) REFERENCES campus(id),
    CONSTRAINT uq_predio_campus UNIQUE (nome, campus_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    predio_id INT NOT NULL,
    CONSTRAINT fk_setores_predios
        FOREIGN KEY (predio_id) REFERENCES predios(id),
    CONSTRAINT uq_setor_predio UNIQUE (nome, predio_id)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS ativos (
    serial_number VARCHAR(20) NOT NULL,
    patrimonio VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    status_ativo VARCHAR(30) NOT NULL DEFAULT 'Disponivel',
    setor_id INT NOT NULL,
    categoria_id INT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    motivo_baixa VARCHAR(255) NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NULL,
    PRIMARY KEY (serial_number),
    CONSTRAINT fk_ativos_setores
        FOREIGN KEY (setor_id) REFERENCES setores(id),
    CONSTRAINT fk_ativos_categorias
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

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
