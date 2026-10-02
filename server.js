/**
 * Express & SQLite Backend Server for Healthcare Appointment Portal
 * 
 * Provides:
 * - Real role-based authentication (Patient & Consulting Physician)
 * - Server-side scrypt password verification and session tokens
 * - Strict doctorId and patientId data isolation
 * - REST API endpoints (/api/v1/...)
 * - Static asset serving (HTML, CSS, JS, Images)
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const db = require('./js/db.js');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// Auto-provision accounts on startup
try {
  db.provisionAccounts();
} catch (e) {
  console.warn("[SERVER] Provisioning warning:", e.message);
}

// Global Middlewares
app.use(cors({
  origin: function(origin, callback) {
    // Allow all local origins (including 'null' for file:// protocol and localhost)
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Authentication Middleware
function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (!token && req.cookies) {
    token = req.cookies.session_token;
  }

  const session = db.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.user = session;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: ${role} role required` });
    }
    next();
  };
}

// ============================================================================
// REST API ROUTES (/api/v1/...)
// ============================================================================

// 1. POST /api/v1/auth/login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  const user = db.authenticateUser(email, password, role);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or unauthorized role access.' });
  }

  const { token } = db.createSession(user);

  res.cookie('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  return res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      doctorId: user.doctorId
    }
  });
});

// 2. POST /api/v1/auth/logout
app.post('/api/v1/auth/logout', (req, res) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (!token && req.cookies) {
    token = req.cookies.session_token;
  }

  if (token) {
    db.deleteSession(token);
  }

  res.clearCookie('session_token', { path: '/' });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// 3. GET /api/v1/auth/me
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      doctorId: req.user.doctorId
    }
  });
});

// 4. GET /api/v1/doctors
app.get('/api/v1/doctors', (req, res) => {
  try {
    const scriptContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'script.js'), 'utf8');
    const match = scriptContent.match(/const DOCTORS_DATA\s*=\s*(\[[\s\S]*?\]);\s*\n\s*\/\//);
    if (match) {
      const vm = require('vm');
      const sandbox = {};
      vm.runInNewContext(`doctors = ${match[1]};`, sandbox);
      return res.status(200).json({ doctors: sandbox.doctors });
    }
    return res.status(500).json({ error: 'Doctor registry unavailable' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read doctor registry' });
  }
});

// 5. GET /api/v1/patient/appointments
app.get('/api/v1/patient/appointments', authenticateToken, requireRole('Patient'), (req, res) => {
  // STRICT: Only retrieve appointments belonging to this authenticated patient
  const appointments = db.getPatientAppointments(req.user.userId);
  return res.status(200).json({ appointments });
});

// 6. POST /api/v1/appointments
app.post('/api/v1/appointments', authenticateToken, requireRole('Patient'), (req, res) => {
  const body = req.body;
  if (!body.doctorId || !body.appointmentDate || !body.timeSlot || !body.patientName) {
    return res.status(400).json({ error: 'Doctor, date, time slot, and patient name are required.' });
  }

  try {
    const newBooking = db.createAppointment({
      ...body,
      patientId: req.user.userId,
      patientEmail: req.user.email
    });
    return res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    if (err.code === 'SLOT_OCCUPIED') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

// 7. PATCH /api/v1/patient/appointments/:id/cancel
app.patch('/api/v1/patient/appointments/:id/cancel', authenticateToken, requireRole('Patient'), (req, res) => {
  const apptId = req.params.id;
  const success = db.cancelPatientAppointment(apptId, req.user.userId);
  if (!success) {
    return res.status(404).json({ error: 'Appointment not found or not owned by patient.' });
  }
  return res.status(200).json({ success: true, message: 'Appointment cancelled successfully.' });
});

// 8. GET /api/v1/physician/appointments
app.get('/api/v1/physician/appointments', authenticateToken, requireRole('Physician'), (req, res) => {
  // STRICT SERVER-SIDE ISOLATION: The backend query strictly uses session.doctorId.
  // Any client-supplied doctorId query param is ignored to prevent cross-doctor leakage!
  const appointments = db.getPhysicianAppointments(req.user.doctorId);
  return res.status(200).json({
    doctorId: req.user.doctorId,
    physicianName: req.user.name,
    appointments
  });
});

// 9. GET /api/v1/physician/appointments/:id
app.get('/api/v1/physician/appointments/:id', authenticateToken, requireRole('Physician'), (req, res) => {
  const apptId = req.params.id;
  const appt = db.getPhysicianAppointmentById(apptId, req.user.doctorId);
  if (!appt) {
    return res.status(403).json({ error: 'Unauthorized: Appointment does not belong to your schedule.' });
  }
  return res.status(200).json({ appointment: appt });
});

// 10. PATCH /api/v1/physician/appointments/:id/status
app.patch('/api/v1/physician/appointments/:id/status', authenticateToken, requireRole('Physician'), (req, res) => {
  const apptId = req.params.id;
  const { status } = req.body;

  try {
    const updated = db.updatePhysicianAppointmentStatus(apptId, req.user.doctorId, status);
    if (!updated) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found.' });
    }
    return res.status(200).json({ success: true, message: `Status updated to ${status}.` });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// STATIC ASSET SERVING
// ============================================================================
app.use(express.static(ROOT_DIR, { index: ['index.html', 'home.html'] }));

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'home.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[EXPRESS SERVER] Healthcare System backend is running at http://localhost:${PORT}`);
    console.log(`[EXPRESS SERVER] REST API endpoints mounted under /api/v1/`);
  });
}

module.exports = app;
