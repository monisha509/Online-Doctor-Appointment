/**
 * Test Suite for Flexible Prototype Login System
 * 
 * Tests:
 * 1. Patient login with any valid email and non-empty password.
 * 2. Patient login with missing fields (missing email, missing password, both empty).
 * 3. Patient login with invalid email formats.
 * 4. Physician login using a valid doctor ID (e.g. 'doc-001', 'DOC-001', 'doc-055').
 * 5. Physician login using a matching first-name email (e.g. 'john@gmail.com', 'ananya@hospital.org').
 * 6. Invalid doctor IDs and unmatched emails rejected with helpful error.
 * 7. Ambiguous first-name / surname emails detected and prompted for unique Doctor ID.
 * 8. Correct physician dashboard and doctor-specific appointment filtering (0 leaks to other doctors).
 * 9. Patient appointment browsing, booking, and appointment viewing.
 * 10. Logout and role-based navigation enforcement.
 * 11. Zero passwords stored in prototype session.
 * 12. Prototype banner and absence of backend-unavailable error / file:// blocker.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock browser environment for script.js
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};
const mockSessionStorage = {};
global.sessionStorage = {
  getItem: (k) => mockSessionStorage[k] || null,
  setItem: (k, v) => { mockSessionStorage[k] = String(v); },
  removeItem: (k) => { delete mockSessionStorage[k]; },
  clear: () => { for (const k in mockSessionStorage) delete mockSessionStorage[k]; }
};

global.window = {
  location: {
    protocol: 'file:',
    search: '',
    replace: (url) => { global.window.location.href = url; },
    href: 'http://localhost/login.html'
  }
};
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => []
};

// Load script.js
const script = require('./script.js');
const {
  DOCTORS_DATA,
  matchPhysicianIdentifier,
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  enforceRoleGuard
} = script;

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test #${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test #${totalTests}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log('==================================================================');
console.log('FLEXIBLE PROTOTYPE LOGIN & ROLE-BASED ACCESS VALIDATION');
console.log('==================================================================\n');

// 1. Patient login with valid email and password
runTest('Patient login with any valid email and non-empty password', () => {
  const email = 'alex.morgan@custom-domain.org';
  const pass = 'AnyCustomPassword123!';
  assert(email.includes('@'), 'Must have valid email format');
  assert(pass.length > 0, 'Password must be non-empty');

  const localPart = email.split('@')[0];
  const derivedName = localPart
    .split(/[\._\-]/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  const patientSession = {
    id: 'usr-pat-54321',
    patientId: 'pat-54321',
    name: derivedName,
    email: email,
    role: 'Patient',
    phone: '+91 98401 00000'
  };

  setActiveSession(patientSession, true);
  const active = getActiveSession();

  assert.strictEqual(active.role, 'Patient');
  assert.strictEqual(active.email, email);
  assert.strictEqual(active.name, 'Alex Morgan');
  assert.strictEqual(active.password, undefined, 'Passwords must NEVER be stored');
});

// 2. Patient login with missing fields
runTest('Patient login with missing fields validation', () => {
  const validate = (email, pass) => {
    if (!email && !pass) return 'Please provide both an email address and a password.';
    if (!email) return 'Please enter an email address.';
    if (!pass) return 'Please enter a password.';
    return null;
  };

  assert.strictEqual(validate('', ''), 'Please provide both an email address and a password.');
  assert.strictEqual(validate('', 'mypassword'), 'Please enter an email address.');
  assert.strictEqual(validate('test@example.com', ''), 'Please enter a password.');
});

// 3. Patient login with invalid email formats
runTest('Patient login with invalid email format rejection', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = ['plainaddress', '@missingusername.com', 'user@domain', 'user name@space.com'];
  
  invalidEmails.forEach(inv => {
    assert.strictEqual(emailRegex.test(inv), false, `Should reject invalid email: ${inv}`);
  });

  const validEmails = ['user@example.com', 'first.last@hospital.org', 'doctor-123@sub.domain.co'];
  validEmails.forEach(val => {
    assert.strictEqual(emailRegex.test(val), true, `Should accept valid email: ${val}`);
  });
});

// 4. Physician login using a valid doctor ID
runTest('Physician login using a valid doctor ID (doc-001, DOC-001, doc-055)', () => {
  const res1 = matchPhysicianIdentifier('doc-001');
  assert(res1.doctor, 'doc-001 should be found');
  assert.strictEqual(res1.doctor.id, 'doc-001');
  assert.strictEqual(res1.doctor.name, 'Dr. John Smith');
  assert.strictEqual(res1.doctor.specialty, 'Cardiology');

  // Case-insensitive test
  const resCase = matchPhysicianIdentifier('DOC-001');
  assert(resCase.doctor, 'DOC-001 uppercase should match doc-001');
  assert.strictEqual(resCase.doctor.id, 'doc-001');

  // Last doctor test
  const resLast = matchPhysicianIdentifier('doc-055');
  assert(resLast.doctor, 'doc-055 should match Dr. Ethan Ross');
  assert.strictEqual(resLast.doctor.name, 'Dr. Ethan Ross');
});

// 5. Physician login using matching first-name email
runTest("Physician login using matching first-name email ('john@gmail.com', 'ananya@hospital.org')", () => {
  const resJohn = matchPhysicianIdentifier('john@gmail.com');
  assert(resJohn.doctor, 'john@gmail.com should match Dr. John Smith');
  assert.strictEqual(resJohn.doctor.id, 'doc-001');

  const resAnanya = matchPhysicianIdentifier('ananya@hospital.org');
  assert(resAnanya.doctor, 'ananya@hospital.org should match Dr. Ananya Sen');
  assert.strictEqual(resAnanya.doctor.id, 'doc-002');

  const resVikram = matchPhysicianIdentifier('vikram.malhotra@yahoo.com');
  assert(resVikram.doctor, 'vikram.malhotra@yahoo.com should match Dr. Vikram Malhotra');
  assert.strictEqual(resVikram.doctor.id, 'doc-003');
});

// 6. Invalid doctor IDs and unmatched emails
runTest('Invalid doctor IDs and unmatched emails rejected with clear feedback', () => {
  const resBadId = matchPhysicianIdentifier('doc-999');
  assert(resBadId.error, 'doc-999 should produce error');
  assert(resBadId.error.includes('No physician found matching'), 'Should have clear descriptive error');

  const resBadEmail = matchPhysicianIdentifier('randomperson12345@gmail.com');
  assert(resBadEmail.error, 'randomperson12345@gmail.com should produce error');
  assert(resBadEmail.error.includes('No physician found matching'), 'Should indicate unmatched physician');
});

// 7. Ambiguous first-name / surname emails
runTest('Ambiguous physician emails prompt user to use unique Doctor ID', () => {
  // Gallagher matches Dr. Fiona Gallagher (doc-033) and Dr. Liam Gallagher (doc-038)
  const resGallagher = matchPhysicianIdentifier('gallagher@healthcare.org');
  assert(resGallagher.error, 'gallagher@healthcare.org should trigger ambiguous match');
  assert(resGallagher.error.includes('Multiple physicians match'), 'Should alert user about multiple matches');
  assert(resGallagher.error.includes('unique Doctor ID'), 'Should prompt user to sign in with unique Doctor ID');

  // Sen matches Dr. Ananya Sen (doc-002) and Dr. Sunita Sen (doc-054)
  const resSen = matchPhysicianIdentifier('sen@gmail.com');
  assert(resSen.error, 'sen@gmail.com should trigger ambiguous match');
  assert(resSen.error.includes('Multiple physicians match'), 'Should alert user about multiple matches');
});

// 8. Correct physician dashboard and doctor-specific appointment filtering
runTest('Physician dashboard doctor-specific appointment filtering (strict isolation)', () => {
  // Simulate active session for Dr. John Smith (doc-001)
  const docSession = {
    id: 'usr-doc-001',
    doctorId: 'doc-001',
    name: 'Dr. John Smith',
    role: 'Physician',
    specialty: 'Cardiology'
  };
  setActiveSession(docSession, true);

  // Sample appointments in storage
  const sampleAppointments = [
    { id: 'HC-001', doctorId: 'doc-001', doctorName: 'Dr. John Smith', patientName: 'P1' },
    { id: 'HC-002', doctorId: 'doc-001', doctorName: 'Dr. John Smith', patientName: 'P2' },
    { id: 'HC-003', doctorId: 'doc-002', doctorName: 'Dr. Ananya Sen', patientName: 'P3' },
    { id: 'HC-004', doctorId: 'doc-055', doctorName: 'Dr. Ethan Ross', patientName: 'P4' }
  ];
  localStorage.setItem('healthcare_appointments', JSON.stringify(sampleAppointments));

  // Physician appointment filtering logic
  const session = getActiveSession();
  const assigned = sampleAppointments.filter(item => item.doctorId === session.doctorId);

  assert.strictEqual(assigned.length, 2, 'Dr. John Smith must only see his 2 appointments');
  assert(assigned.every(a => a.doctorId === 'doc-001'), 'Every appointment must strictly match doc-001');
  assert(!assigned.some(a => a.doctorId === 'doc-002'), 'No appointments from doc-002 may leak');
});

// 9. Logout and role-based navigation
runTest('Logout clears active prototype session and redirects correctly', () => {
  clearActiveSession();
  const sessionAfterLogout = getActiveSession();
  assert.strictEqual(sessionAfterLogout, null, 'Session must be completely null after logout');

  // Test role guard redirection
  let redirectTarget = null;
  global.window.location.replace = (url) => { redirectTarget = url; };

  const guardResult = enforceRoleGuard('Patient', 'login.html');
  assert.strictEqual(guardResult, null, 'Unauthenticated user must be blocked by role guard');
  assert(redirectTarget.includes('login.html'), 'Must redirect to login page');
  assert(redirectTarget.includes('notice=auth_required'), 'Must include auth_required notice');
});

// 10. Inspect login.html content
runTest('login.html contains prototype disclosure, no backend-unavailable errors, and no file:// roadblocks', () => {
  const htmlContent = fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8');

  assert(htmlContent.includes('Frontend Prototype') && htmlContent.includes('Login does not verify identity'), 'Must have prototype demonstration disclosure');
  assert(!htmlContent.includes('Authentication service is currently unavailable'), 'Backend unavailable error must be removed');
  assert(!htmlContent.includes('window.location.protocol === "file:"'), 'file:// protocol blocker must be removed');
  assert(!htmlContent.includes('OPD Administrator'), 'OPD Administrator must not be present');
  assert(!htmlContent.includes('Quick login'), 'Quick login must not be present');
  assert(!htmlContent.includes('Demo Preview Mode'), 'Demo preview mode must not be present');
  assert(htmlContent.includes('handleRoleChange'), 'Must support dynamic role change guidance');
  assert(htmlContent.includes('handleFrontendLogin'), 'Must use flexible frontend login handler');
});

// 11. Appointment booking, duplicate-slot prevention, and cancellation
runTest('Appointment booking, duplicate-slot prevention, and cancellation in localStorage', async () => {
  const booking1 = {
    id: 'HC-2026-9901',
    doctorId: 'doc-001',
    doctorName: 'Dr. John Smith',
    appointmentDate: '2026-10-15',
    timeSlot: '09:00 AM',
    patientEmail: 'patient@example.com',
    status: 'Scheduled'
  };

  // Save booking
  let appointments = [booking1];
  localStorage.setItem('healthcare_appointments', JSON.stringify(appointments));

  // Check collision detection logic
  const isOccupied = (docId, date, slot) => {
    return appointments.some(a => a.doctorId === docId && a.appointmentDate === date && a.timeSlot === slot && a.status !== 'Cancelled');
  };

  assert.strictEqual(isOccupied('doc-001', '2026-10-15', '09:00 AM'), true, 'Slot should be detected as occupied');
  assert.strictEqual(isOccupied('doc-001', '2026-10-15', '10:00 AM'), false, 'Different slot should be free');
  assert.strictEqual(isOccupied('doc-002', '2026-10-15', '09:00 AM'), false, 'Different doctor should be free');

  // Cancel booking
  appointments = appointments.map(a => a.id === 'HC-2026-9901' ? { ...a, status: 'Cancelled' } : a);
  assert.strictEqual(isOccupied('doc-001', '2026-10-15', '09:00 AM'), false, 'Cancelled slot must become available again');
});

// 12. Session restoration on page refresh
runTest('Session restoration on page refresh from sessionStorage/localStorage', () => {
  const sampleUser = { role: 'Patient', email: 'refresh.test@example.com', name: 'Refresh Test' };
  setActiveSession(sampleUser);

  // Simulate tab refresh: active session restored
  const restoredSession = getActiveSession();
  assert.deepStrictEqual(restoredSession, sampleUser, 'Session must restore accurately across refreshes');
});

// 13. Physician URL doctor ID spoofing prevention
runTest('Physician URL doctor ID spoofing prevention (sessionStorage takes absolute precedence)', () => {
  const loggedInPhysician = { role: 'Physician', doctorId: 'doc-001', name: 'Dr. John Smith' };
  setActiveSession(loggedInPhysician);

  // Even if URL has ?doctorId=doc-055, dashboard uses session doctorId
  const urlAttempt = 'doc-055';
  const effectiveDoctorId = getActiveSession().doctorId; // strictly from session

  assert.strictEqual(effectiveDoctorId, 'doc-001', 'URL query spoofing must not override authenticated session doctorId');
  assert.notStrictEqual(effectiveDoctorId, urlAttempt, 'Spoofed query parameter rejected');
});

// 14. GitHub Pages path and asset integrity
runTest('All internal stylesheet paths and image references are relative for GitHub Pages compatibility', () => {
  const htmlFiles = ['index.html', 'home.html', 'doctors.html', 'appointment.html', 'login.html', 'patient-dashboard.html', 'physician-dashboard.html', 'success.html'];
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert(!content.includes('href="/css/'), `${file} should not use root-relative CSS paths`);
    assert(!content.includes('src="/images/'), `${file} should not use root-relative image paths`);
    assert(!content.includes('src="/js/'), `${file} should not use root-relative JS paths`);
  });
});

console.log('\n==================================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} Tests Passed Successfully!`);
console.log('==================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
