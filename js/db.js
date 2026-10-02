/**
 * Database & Account Management Module for Healthcare Appointment Portal
 * Uses Node.js 24 built-in SQLite (node:sqlite) and native crypto.
 * Enforces server-side password hashing (scrypt) and role-based data isolation.
 */

const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'healthcare.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Patient', 'Physician')),
    name TEXT NOT NULL,
    phone TEXT,
    doctor_id TEXT UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    doctor_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    patient_age INTEGER,
    patient_gender TEXT,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Completed', 'Cancelled')),
    fee REAL NOT NULL,
    room TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(patient_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

/**
 * Secure password hashing using native scrypt
 */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch (e) {
    return false;
  }
}

/**
 * Generate secure session token (32 random bytes)
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Provision initial accounts (All 55 Physicians and Sample Patients)
 */
function provisionAccounts() {
  // Load doctors registry from script.js
  const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const match = scriptContent.match(/const DOCTORS_DATA\s*=\s*(\[[\s\S]*?\]);\s*\n\s*\/\//);
  if (!match) {
    throw new Error("Unable to parse DOCTORS_DATA from script.js");
  }

  // Evaluate DOCTORS_DATA safely
  const vm = require('vm');
  const sandbox = {};
  vm.runInNewContext(`doctors = ${match[1]};`, sandbox);
  const doctors = sandbox.doctors;

  const credentialsLog = [];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, salt, role, name, phone, doctor_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Provision all 55 Physicians
  doctors.forEach((doc, idx) => {
    const email = doc.email.toLowerCase();
    const accountId = `usr-${doc.id}`;
    // Secure non-trivial default password for testing: Doctor#<id>2026!
    const defaultPassword = `Doctor#${doc.id}2026!`;
    const { hash, salt } = hashPassword(defaultPassword);

    insertUser.run(
      accountId,
      email,
      hash,
      salt,
      'Physician',
      doc.name,
      doc.phone || '+91 98400 00000',
      doc.id,
      new Date().toISOString()
    );

    credentialsLog.push({
      role: 'Physician',
      doctorId: doc.id,
      name: doc.name,
      specialty: doc.specialty,
      email: email,
      password: defaultPassword
    });
  });

  // 2. Provision Patient Accounts
  const patientAccounts = [
    {
      id: 'usr-pat-101',
      name: 'Ananya Raman',
      email: 'ananya.raman@healthcare.demo',
      phone: '+91 98401 99999',
      password: 'Patient#Secure2026!'
    },
    {
      id: 'usr-pat-102',
      name: 'Karthik Verma',
      email: 'karthik.verma@healthcare.demo',
      phone: '+91 98402 88888',
      password: 'Patient#Secure2026!'
    }
  ];

  patientAccounts.forEach(pat => {
    const { hash, salt } = hashPassword(pat.password);
    insertUser.run(
      pat.id,
      pat.email.toLowerCase(),
      hash,
      salt,
      'Patient',
      pat.name,
      pat.phone,
      null,
      new Date().toISOString()
    );

    credentialsLog.push({
      role: 'Patient',
      patientId: pat.id,
      name: pat.name,
      email: pat.email,
      password: pat.password
    });
  });

  // 3. Seed sample appointments if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM appointments');
  const countResult = countStmt.get();

  if (countResult.count === 0) {
    const insertAppt = db.prepare(`
      INSERT INTO appointments (id, patient_id, patient_name, patient_email, patient_phone, patient_age, patient_gender, doctor_id, doctor_name, specialty, appointment_date, time_slot, status, fee, room, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    insertAppt.run(
      'HC-2026-1042',
      'usr-pat-101',
      'Ananya Raman',
      'ananya.raman@healthcare.demo',
      '+91 98401 99999',
      32,
      'Female',
      'doc-001',
      'Dr. John Smith',
      'Cardiology',
      today,
      '10:00 AM',
      'Scheduled',
      700,
      'Cardiology Wing - Room 101',
      'Routine quarterly cardiovascular review and BP check.',
      new Date().toISOString()
    );

    insertAppt.run(
      'HC-2026-1043',
      'usr-pat-102',
      'Karthik Verma',
      'karthik.verma@healthcare.demo',
      '+91 98402 88888',
      48,
      'Male',
      'doc-001',
      'Dr. John Smith',
      'Cardiology',
      tomorrow,
      '11:15 AM',
      'Scheduled',
      700,
      'Cardiology Wing - Room 101',
      'Hypertension assessment and medication review.',
      new Date().toISOString()
    );

    insertAppt.run(
      'HC-2026-1045',
      'usr-pat-101',
      'Ananya Raman',
      'ananya.raman@healthcare.demo',
      '+91 98401 99999',
      32,
      'Female',
      'doc-021',
      'Dr. Emily Clark',
      'Dermatology',
      tomorrow,
      '02:30 PM',
      'Scheduled',
      600,
      'Skin & Laser Suite - Room 501',
      'Follow up consultation for seasonal skin allergy.',
      new Date().toISOString()
    );
  }

  // Save provisioned credentials documentation to data directory
  fs.writeFileSync(
    path.join(DATA_DIR, 'provisioned_credentials.json'),
    JSON.stringify(credentialsLog, null, 2),
    'utf8'
  );

  console.log(`[DB] Successfully provisioned ${doctors.length} physician accounts and ${patientAccounts.length} patient accounts into SQLite.`);
}

// User & Authentication Operations
function authenticateUser(email, password, role) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?');
  const user = stmt.get(email.toLowerCase(), role);
  if (!user) return null;

  const valid = verifyPassword(password, user.password_hash, user.salt);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    doctorId: user.doctor_id
  };
}

function createSession(user) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, role, doctor_id, name, email, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    token,
    user.id,
    user.role,
    user.doctorId || null,
    user.name,
    user.email,
    expiresAt,
    new Date().toISOString()
  );
  return { token, expiresAt };
}

function getSession(token) {
  if (!token) return null;
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ?');
  const session = stmt.get(token);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    deleteSession(token);
    return null;
  }

  return {
    token: session.token,
    userId: session.user_id,
    role: session.role,
    doctorId: session.doctor_id,
    name: session.name,
    email: session.email
  };
}

function deleteSession(token) {
  if (!token) return;
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

// Appointment Operations (Server-Side Enforced Isolation)
function getPatientAppointments(patientId) {
  const stmt = db.prepare(`
    SELECT * FROM appointments 
    WHERE patient_id = ? 
    ORDER BY appointment_date ASC, time_slot ASC
  `);
  return stmt.all(patientId);
}

function getPhysicianAppointments(doctorId) {
  // STRICT SERVER-SIDE ENFORCEMENT: only appointments assigned to this doctor
  const stmt = db.prepare(`
    SELECT * FROM appointments 
    WHERE doctor_id = ? 
    ORDER BY appointment_date ASC, time_slot ASC
  `);
  return stmt.all(doctorId);
}

function getPhysicianAppointmentById(appointmentId, doctorId) {
  const stmt = db.prepare(`
    SELECT * FROM appointments 
    WHERE id = ? AND doctor_id = ?
  `);
  return stmt.get(appointmentId, doctorId);
}

function createAppointment(data) {
  // Check slot collision
  const collisionStmt = db.prepare(`
    SELECT id FROM appointments 
    WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status != 'Cancelled'
  `);
  const existing = collisionStmt.get(data.doctorId, data.appointmentDate, data.timeSlot);
  if (existing) {
    const err = new Error(`Time slot ${data.timeSlot} on ${data.appointmentDate} is already booked.`);
    err.code = 'SLOT_OCCUPIED';
    throw err;
  }

  const id = `HC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const insertStmt = db.prepare(`
    INSERT INTO appointments (
      id, patient_id, patient_name, patient_email, patient_phone, patient_age, patient_gender,
      doctor_id, doctor_name, specialty, appointment_date, time_slot, status, fee, room, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    id,
    data.patientId,
    data.patientName,
    data.patientEmail || '',
    data.patientPhone || '',
    data.patientAge || 30,
    data.patientGender || 'Not Specified',
    data.doctorId,
    data.doctorName,
    data.specialty,
    data.appointmentDate,
    data.timeSlot,
    'Scheduled',
    data.fee || 500,
    data.room || 'Main OPD Suite',
    data.notes || '',
    new Date().toISOString()
  );

  const getStmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
  return getStmt.get(id);
}

function cancelPatientAppointment(appointmentId, patientId) {
  const checkStmt = db.prepare('SELECT * FROM appointments WHERE id = ? AND patient_id = ?');
  const appt = checkStmt.get(appointmentId, patientId);
  if (!appt) {
    return false;
  }

  const updateStmt = db.prepare("UPDATE appointments SET status = 'Cancelled' WHERE id = ?");
  updateStmt.run(appointmentId);
  return true;
}

function updatePhysicianAppointmentStatus(appointmentId, doctorId, newStatus) {
  const valid = ['Scheduled', 'Completed', 'Cancelled'];
  if (!valid.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  // Must verify appointment is assigned to this physician
  const checkStmt = db.prepare('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?');
  const appt = checkStmt.get(appointmentId, doctorId);
  if (!appt) {
    return false;
  }

  const updateStmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
  updateStmt.run(newStatus, appointmentId);
  return true;
}

module.exports = {
  db,
  provisionAccounts,
  hashPassword,
  verifyPassword,
  authenticateUser,
  createSession,
  getSession,
  deleteSession,
  getPatientAppointments,
  getPhysicianAppointments,
  getPhysicianAppointmentById,
  createAppointment,
  cancelPatientAppointment,
  updatePhysicianAppointmentStatus
};
