/**
 * Zero-dependency Node.js HTTP Server & REST API for Healthcare Appointment Portal
 * Combines static asset serving with server-side authenticated REST API endpoints:
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/logout
 *   GET  /api/v1/auth/me
 *   GET  /api/v1/doctors
 *   GET  /api/v1/patient/appointments
 *   POST /api/v1/appointments
 *   PATCH /api/v1/patient/appointments/:id/cancel
 *   GET  /api/v1/physician/appointments
 *   GET  /api/v1/physician/appointments/:id
 *   PATCH /api/v1/physician/appointments/:id/status
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db.js');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');

// Ensure accounts are provisioned
try {
  db.provisionAccounts();
} catch (e) {
  console.warn("[SERVER] Notice during provisioning:", e.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  });
  res.end(JSON.stringify(data));
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

function getSessionFromRequest(req) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (!token) {
    const cookies = parseCookies(req);
    token = cookies['session_token'];
  }
  return db.getSession(token);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // REST API ENDPOINTS (/api/v1/...)
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/')) {
    try {
      // 1. POST /api/v1/auth/login
      if (pathname === '/api/v1/auth/login' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const { email, password, role } = body;

        if (!email || !password || !role) {
          return sendJson(res, 400, { error: 'Email, password, and role are required.' });
        }

        const user = db.authenticateUser(email, password, role);
        if (!user) {
          return sendJson(res, 401, { error: 'Invalid credentials or unauthorized role access.' });
        }

        const { token, expiresAt } = db.createSession(user);
        return sendJson(res, 200, {
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
        }, {
          'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Lax`
        });
      }

      // 2. POST /api/v1/auth/logout
      if (pathname === '/api/v1/auth/logout' && req.method === 'POST') {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
        if (!token) {
          const cookies = parseCookies(req);
          token = cookies['session_token'];
        }
        if (token) {
          db.deleteSession(token);
        }
        return sendJson(res, 200, { success: true, message: 'Logged out successfully.' }, {
          'Set-Cookie': 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        });
      }

      // 3. GET /api/v1/auth/me
      if (pathname === '/api/v1/auth/me' && req.method === 'GET') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Unauthenticated' });
        }
        return sendJson(res, 200, {
          user: {
            id: session.userId,
            email: session.email,
            role: session.role,
            name: session.name,
            doctorId: session.doctorId
          }
        });
      }

      // 4. GET /api/v1/doctors
      if (pathname === '/api/v1/doctors' && req.method === 'GET') {
        // Return 55 doctors from local script.js registry
        const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
        const match = scriptContent.match(/const DOCTORS_DATA\s*=\s*(\[[\s\S]*?\]);\s*\n\s*\/\//);
        if (match) {
          const vm = require('vm');
          const sandbox = {};
          vm.runInNewContext(`doctors = ${match[1]};`, sandbox);
          return sendJson(res, 200, { doctors: sandbox.doctors });
        }
        return sendJson(res, 500, { error: 'Doctor registry unavailable' });
      }

      // 5. GET /api/v1/patient/appointments
      if (pathname === '/api/v1/patient/appointments' && req.method === 'GET') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Patient') {
          return sendJson(res, 403, { error: 'Forbidden: Patient role required' });
        }

        // STRICT: Only retrieve appointments belonging to this authenticated patient
        const appointments = db.getPatientAppointments(session.userId);
        return sendJson(res, 200, { appointments });
      }

      // 6. POST /api/v1/appointments
      if (pathname === '/api/v1/appointments' && req.method === 'POST') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Patient') {
          return sendJson(res, 403, { error: 'Only authenticated patients can schedule appointments' });
        }

        const body = await readJsonBody(req);
        if (!body.doctorId || !body.appointmentDate || !body.timeSlot || !body.patientName) {
          return sendJson(res, 400, { error: 'Doctor, date, time slot, and patient name are required.' });
        }

        try {
          const newBooking = db.createAppointment({
            ...body,
            patientId: session.userId,
            patientEmail: session.email
          });
          return sendJson(res, 201, { success: true, booking: newBooking });
        } catch (err) {
          if (err.code === 'SLOT_OCCUPIED') {
            return sendJson(res, 409, { error: err.message });
          }
          return sendJson(res, 500, { error: err.message });
        }
      }

      // 7. PATCH /api/v1/patient/appointments/:id/cancel
      const patientCancelMatch = pathname.match(/^\/api\/v1\/patient\/appointments\/([^/]+)\/cancel$/);
      if (patientCancelMatch && req.method === 'PATCH') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Patient') {
          return sendJson(res, 403, { error: 'Forbidden' });
        }

        const apptId = decodeURIComponent(patientCancelMatch[1]);
        const success = db.cancelPatientAppointment(apptId, session.userId);
        if (!success) {
          return sendJson(res, 404, { error: 'Appointment not found or not owned by patient.' });
        }
        return sendJson(res, 200, { success: true, message: 'Appointment cancelled successfully.' });
      }

      // 8. GET /api/v1/physician/appointments
      if (pathname === '/api/v1/physician/appointments' && req.method === 'GET') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Physician') {
          return sendJson(res, 403, { error: 'Forbidden: Physician role required' });
        }

        // STRICT SERVER-SIDE ISOLATION: The backend query strictly uses session.doctorId.
        // Any client-supplied doctorId query param is ignored to prevent cross-doctor leakage!
        const appointments = db.getPhysicianAppointments(session.doctorId);
        return sendJson(res, 200, {
          doctorId: session.doctorId,
          physicianName: session.name,
          appointments
        });
      }

      // 9. GET /api/v1/physician/appointments/:id
      const physicianDetailMatch = pathname.match(/^\/api\/v1\/physician\/appointments\/([^/]+)$/);
      if (physicianDetailMatch && req.method === 'GET') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Physician') {
          return sendJson(res, 403, { error: 'Forbidden' });
        }

        const apptId = decodeURIComponent(physicianDetailMatch[1]);
        const appt = db.getPhysicianAppointmentById(apptId, session.doctorId);
        if (!appt) {
          return sendJson(res, 403, { error: 'Unauthorized: Appointment does not belong to your schedule.' });
        }
        return sendJson(res, 200, { appointment: appt });
      }

      // 10. PATCH /api/v1/physician/appointments/:id/status
      const physicianStatusMatch = pathname.match(/^\/api\/v1\/physician\/appointments\/([^/]+)\/status$/);
      if (physicianStatusMatch && req.method === 'PATCH') {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Authentication required' });
        }
        if (session.role !== 'Physician') {
          return sendJson(res, 403, { error: 'Forbidden' });
        }

        const apptId = decodeURIComponent(physicianStatusMatch[1]);
        const body = await readJsonBody(req);
        const { status } = body;

        try {
          const updated = db.updatePhysicianAppointmentStatus(apptId, session.doctorId, status);
          if (!updated) {
            return sendJson(res, 403, { error: 'Unauthorized or appointment not found.' });
          }
          return sendJson(res, 200, { success: true, message: `Status updated to ${status}.` });
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      // If no API route matched
      return sendJson(res, 404, { error: 'API endpoint not found' });
    } catch (err) {
      console.error('[SERVER ERROR]', err);
      return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
    }
  }

  // -------------------------------------------------------------
  // STATIC ASSET SERVING
  // -------------------------------------------------------------
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(ROOT_DIR, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[SERVER] Healthcare System backend is running at http://localhost:${PORT}`);
  console.log(`[SERVER] REST API endpoints mounted under /api/v1/`);
});
