/**
 * Comprehensive Validation Test Suite for Real Role-Based Authentication
 * Tests all 12 criteria from Section 8 of the project specifications.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db.js');

const ROOT_DIR = path.join(__dirname, '..');
const BASE_URL = 'http://localhost:3000';

console.log("==================================================================");
console.log("REAL ROLE-BASED AUTHENTICATION & REST API VALIDATION TEST SUITE");
console.log("==================================================================\n");

let totalPassed = 0;
let totalFailed = 0;

function assertTest(condition, testId, description) {
  if (condition) {
    console.log(`[PASS] Test #${testId}: ${description}`);
    totalPassed++;
  } else {
    console.error(`[FAIL] Test #${testId}: ${description}`);
    totalFailed++;
  }
}

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  try {
    // -------------------------------------------------------------
    // Test 1: No demo login options remain
    // -------------------------------------------------------------
    const loginHtml = fs.readFileSync(path.join(ROOT_DIR, 'login.html'), 'utf8');
    const physHtml = fs.readFileSync(path.join(ROOT_DIR, 'physician-dashboard.html'), 'utf8');
    const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'script.js'), 'utf8');

    const hasDemoPreview = loginHtml.toLowerCase().includes("demo preview mode") ||
                           loginHtml.includes("handleDemoQuickLogin") ||
                           loginHtml.includes("demoPhysicianSelect");
    const hasPhysicianSwitcher = physHtml.includes("quickSwitchDocSelect") ||
                                 physHtml.includes("switchDemoPhysician");
    const hasDemoAccountsInScript = scriptJs.includes("DEMO_PREVIEW_ACCOUNTS") ||
                                    scriptJs.includes("loginDemo");

    assertTest(
      !hasDemoPreview && !hasPhysicianSwitcher && !hasDemoAccountsInScript,
      1,
      "No demo login options, quick logins, or mock preview switchers remain in HTML or JavaScript."
    );

    // -------------------------------------------------------------
    // Test 2: Only Patient and Consulting Physician roles are available
    // -------------------------------------------------------------
    const optionsMatch = [...loginHtml.matchAll(/<option[^>]*value="([^"]+)"[^>]*>/g)];
    const roleValues = optionsMatch.map(m => m[1]);
    const exactlyTwoRoles = roleValues.length === 2 &&
                            roleValues.includes("Patient") &&
                            roleValues.includes("Physician");

    assertTest(
      exactlyTwoRoles && !loginHtml.toLowerCase().includes("opd administrator"),
      2,
      "Login role selector provides strictly two roles (Patient & Consulting Physician). OPD Administrator is completely removed."
    );

    // -------------------------------------------------------------
    // Test 3: Invalid credentials are rejected by backend
    // -------------------------------------------------------------
    const invalidRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'nonexistent@healthcare.demo',
      password: 'WrongPassword123!',
      role: 'Patient'
    });

    const wrongPassRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'ananya.raman@healthcare.demo',
      password: 'IncorrectPassword!',
      role: 'Patient'
    });

    assertTest(
      invalidRes.status === 401 && wrongPassRes.status === 401,
      3,
      "Invalid credentials and mismatched passwords strictly rejected with HTTP 401 Unauthorized."
    );

    // -------------------------------------------------------------
    // Test 4: Valid patient credentials open patient dashboard
    // -------------------------------------------------------------
    const patientLoginRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'ananya.raman@healthcare.demo',
      password: 'Patient#Secure2026!',
      role: 'Patient'
    });

    const patientToken = patientLoginRes.data.token;
    const patientUser = patientLoginRes.data.user;

    assertTest(
      patientLoginRes.status === 200 &&
      patientToken &&
      patientUser &&
      patientUser.role === 'Patient' &&
      patientUser.email === 'ananya.raman@healthcare.demo',
      4,
      `Valid patient credentials authenticated successfully for ${patientUser ? patientUser.name : ''} (ID: ${patientUser ? patientUser.id : ''}).`
    );

    // -------------------------------------------------------------
    // Test 5: Valid physician credentials open correct physician dashboard
    // -------------------------------------------------------------
    const physicianLoginRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'dr.johnsmith@healthcare.demo',
      password: 'Doctor#doc-0012026!',
      role: 'Physician'
    });

    const physicianToken = physicianLoginRes.data.token;
    const physicianUser = physicianLoginRes.data.user;

    assertTest(
      physicianLoginRes.status === 200 &&
      physicianToken &&
      physicianUser &&
      physicianUser.role === 'Physician' &&
      physicianUser.doctorId === 'doc-001',
      5,
      `Valid physician credentials authenticated successfully for ${physicianUser ? physicianUser.name : ''} (Doctor ID: ${physicianUser ? physicianUser.doctorId : ''}).`
    );

    // -------------------------------------------------------------
    // Test 6: All 55 physician accounts provisioned and associated with unique doctor IDs
    // -------------------------------------------------------------
    const physicianCount = db.db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'Physician'").get().count;
    const uniqueDoctorIds = db.db.prepare("SELECT COUNT(DISTINCT doctor_id) as count FROM users WHERE role = 'Physician' AND doctor_id IS NOT NULL").get().count;

    assertTest(
      physicianCount === 55 && uniqueDoctorIds === 55,
      6,
      `All 55 physician accounts provisioned in SQLite database with unique doctor IDs (doc-001 to doc-055).`
    );

    // -------------------------------------------------------------
    // Test 7: Physicians cannot access appointments assigned to other doctors
    // -------------------------------------------------------------
    // Log in as Dr. Emily Clark (doc-021, Dermatology)
    const drClarkRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'dr.emilyclark@healthcare.demo',
      password: 'Doctor#doc-0212026!',
      role: 'Physician'
    });
    const drClarkToken = drClarkRes.data.token;

    // Dr. Clark attempts to inspect Dr. Smith's appointment (HC-2026-1042)
    const crossDoctorAttempt = await apiRequest('GET', '/api/v1/physician/appointments/HC-2026-1042', null, drClarkToken);
    
    // Dr. Clark lists all appointments
    const drClarkListRes = await apiRequest('GET', '/api/v1/physician/appointments', null, drClarkToken);
    const hasForeignDoctor = drClarkListRes.data.appointments.some(a => a.doctor_id !== 'doc-021');

    assertTest(
      crossDoctorAttempt.status === 403 && !hasForeignDoctor,
      7,
      "Backend strictly enforces physician appointment isolation: cross-doctor appointment queries return 403 Forbidden with 0 leaks."
    );

    // -------------------------------------------------------------
    // Test 8: Patients cannot access other patients' records
    // -------------------------------------------------------------
    // Log in as second patient (Karthik Verma, usr-pat-102)
    const pat2LoginRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'karthik.verma@healthcare.demo',
      password: 'Patient#Secure2026!',
      role: 'Patient'
    });
    const pat2Token = pat2LoginRes.data.token;

    // Pat2 fetches their appointments
    const pat2ListRes = await apiRequest('GET', '/api/v1/patient/appointments', null, pat2Token);
    const hasOtherPatientRecords = pat2ListRes.data.appointments.some(a => a.patient_id !== 'usr-pat-102');

    // Pat2 attempts to cancel Ananya's appointment (HC-2026-1042)
    const unauthorizedCancelRes = await apiRequest('PATCH', '/api/v1/patient/appointments/HC-2026-1042/cancel', null, pat2Token);

    assertTest(
      !hasOtherPatientRecords && unauthorizedCancelRes.status === 404,
      8,
      "Patient data access strictly isolated: patient cannot view or cancel another patient's appointment records."
    );

    // -------------------------------------------------------------
    // Test 9: Appointment booking and confirmation work through the backend
    // -------------------------------------------------------------
    const randomDayOffset = Math.floor(15 + Math.random() * 200);
    const testDate = new Date(Date.now() + randomDayOffset * 86400000).toISOString().split('T')[0];
    const newBookingRes = await apiRequest('POST', '/api/v1/appointments', {
      doctorId: 'doc-005',
      doctorName: 'Dr. Arun Prakash',
      specialty: 'Cardiology',
      appointmentDate: testDate,
      timeSlot: '04:00 PM',
      patientName: 'Ananya Raman',
      patientPhone: '+91 98401 99999',
      patientAge: 32,
      patientGender: 'Female',
      fee: 650,
      room: 'Cardiology Wing - Room 105',
      notes: 'Consultation for periodic wellness assessment'
    }, patientToken);

    const bookingCreated = newBookingRes.status === 201 && newBookingRes.data.booking;
    const bookingId = bookingCreated ? newBookingRes.data.booking.id : null;

    // Verify duplicate booking on identical slot is blocked with 409 Conflict
    const dupRes = await apiRequest('POST', '/api/v1/appointments', {
      doctorId: 'doc-005',
      doctorName: 'Dr. Arun Prakash',
      specialty: 'Cardiology',
      appointmentDate: testDate,
      timeSlot: '04:00 PM',
      patientName: 'Conflicting Patient',
      patientPhone: '+91 99999 00000'
    }, patientToken);

    assertTest(
      newBookingRes.status === 201 && bookingId && dupRes.status === 409,
      9,
      `Appointment booking created via backend (ID: ${bookingId}). Duplicate slot collision rejected with HTTP 409 Conflict.`
    );

    // -------------------------------------------------------------
    // Test 10: Appointment status changes are authorized
    // -------------------------------------------------------------
    // Dr. Arun Prakash (doc-005) logs in
    const drPrakashRes = await apiRequest('POST', '/api/v1/auth/login', {
      email: 'dr.arunprakash@healthcare.demo',
      password: 'Doctor#doc-0052026!',
      role: 'Physician'
    });
    const drPrakashToken = drPrakashRes.data.token;

    // Dr. Prakash updates appointment to Completed
    const updateRes = await apiRequest('PATCH', `/api/v1/physician/appointments/${bookingId}/status`, {
      status: 'Completed'
    }, drPrakashToken);

    // Dr. Smith (doc-001) attempts to update Dr. Prakash's appointment
    const unauthUpdateRes = await apiRequest('PATCH', `/api/v1/physician/appointments/${bookingId}/status`, {
      status: 'Cancelled'
    }, physicianToken);

    assertTest(
      updateRes.status === 200 && unauthUpdateRes.status === 403,
      10,
      "Physician status update to 'Completed' succeeded. Unauthorized status change by another physician rejected with HTTP 403 Forbidden."
    );

    // -------------------------------------------------------------
    // Test 11: Logout invalidates the session
    // -------------------------------------------------------------
    const logoutRes = await apiRequest('POST', '/api/v1/auth/logout', null, patientToken);
    const postLogoutCheck = await apiRequest('GET', '/api/v1/auth/me', null, patientToken);

    assertTest(
      logoutRes.status === 200 && postLogoutCheck.status === 401,
      11,
      "Logout invalidates the session token in the database. Subsequent requests with that token return 401 Unauthorized."
    );

    // -------------------------------------------------------------
    // Test 12: Protected API endpoints reject unauthorized requests
    // -------------------------------------------------------------
    const unauthPatientAppts = await apiRequest('GET', '/api/v1/patient/appointments');
    const unauthPhysicianAppts = await apiRequest('GET', '/api/v1/physician/appointments');
    const unauthCreateAppt = await apiRequest('POST', '/api/v1/appointments', { doctorId: 'doc-001' });

    assertTest(
      unauthPatientAppts.status === 401 &&
      unauthPhysicianAppts.status === 401 &&
      unauthCreateAppt.status === 401,
      12,
      "Protected API endpoints strictly reject unauthenticated requests with HTTP 401 Unauthorized."
    );

    console.log("\n==================================================================");
    console.log(`TEST RESULTS: ${totalPassed} / 12 PASSED, ${totalFailed} FAILED`);
    console.log("==================================================================");

    if (totalFailed > 0) {
      process.exit(1);
    } else {
      console.log("ALL 12 VERIFICATION CRITERIA PASSED WITHOUT ERRORS!\n");
    }

  } catch (err) {
    console.error("Test execution exception:", err);
    process.exit(1);
  }
}

runTests();
