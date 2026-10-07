-- ============================================
-- Healthcare Appointment & Patient Management
-- PostgreSQL Schema
-- ============================================

DROP TABLE IF EXISTS prescription CASCADE;
DROP TABLE IF EXISTS appointment CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;
DROP TABLE IF EXISTS patient CASCADE;
DROP TABLE IF EXISTS department CASCADE;

-- ---------- Department ----------
CREATE TABLE department (
    dept_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    location    VARCHAR(150) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Patient ----------
CREATE TABLE patient (
    patient_id    SERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    dob           DATE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Doctor ----------
CREATE TABLE doctor (
    doctor_id     SERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    specialty     VARCHAR(100) NOT NULL,
    dept_id       INT REFERENCES department(dept_id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Appointment ----------
CREATE TABLE appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id     INT NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    doctor_id      INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMP NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','cancelled','completed')),
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_patient ON appointment(patient_id);
CREATE INDEX idx_appointment_doctor  ON appointment(doctor_id);
CREATE INDEX idx_appointment_status  ON appointment(status);

-- ---------- Prescription (新功能) ----------
CREATE TABLE prescription (
    prescription_id SERIAL PRIMARY KEY,
    appointment_id  INT NOT NULL REFERENCES appointment(appointment_id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    dosage          VARCHAR(50)  NOT NULL,
    frequency       VARCHAR(50)  NOT NULL,
    duration_days   INT          NOT NULL CHECK (duration_days > 0),
    fda_ndc_code    VARCHAR(50),
    issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescription_appointment ON prescription(appointment_id);