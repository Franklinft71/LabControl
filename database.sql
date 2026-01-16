
-- Script SQL para Control de Laboratorio Clínico

CREATE DATABASE IF NOT EXISTS lab_control;
USE lab_control;

-- Tabla de Usuarios (Para el Sistema de Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'tecnico') DEFAULT 'tecnico'
);

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('M', 'F') NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Exámenes (Catálogo)
CREATE TABLE IF NOT EXISTS examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_examen VARCHAR(150) NOT NULL,
    rango_referencia VARCHAR(100) NOT NULL, -- Ej: "70-110"
    unidad_medida VARCHAR(20) NOT NULL,    -- Ej: "mg/dL"
    precio DECIMAL(10, 2) NOT NULL
);

-- Tabla de Resultados
CREATE TABLE IF NOT EXISTS resultados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    examen_id INT NOT NULL,
    valor_resultado DECIMAL(10, 2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

-- Insertar datos de prueba iniciales
INSERT INTO examenes (nombre_examen, rango_referencia, unidad_medida, precio) VALUES
('Glucosa en Ayunas', '70-100', 'mg/dL', 15.00),
('Colesterol Total', '150-200', 'mg/dL', 20.00),
('Hemoglobina Glicosilada', '4.0-5.6', '%', 35.00),
('Creatinina', '0.7-1.3', 'mg/dL', 18.00);

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@lab.com', 'admin123', 'admin');
