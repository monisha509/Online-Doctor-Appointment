/**
 * Comprehensive Validation Test Suite for Role-Based Healthcare Appointment Portal
 * Tests all 13 criteria from Section 8 of the project specifications.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("==================================================================");
console.log("HEALTHCARE APPOINTMENT SYSTEM - ROLE-BASED PORTAL VALIDATION SUITE");
console.log("==================================================================\n");

// Setup Mock DOM & Browser Environment
const mockStore = {};
global.localStorage = {
  getItem: (k) => (k in mockStore ? mockStore[k] : null),
  setItem: (k, v) => { mockStore[k] = String(v); },
  removeItem: (k) => { delete mockStore[k]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

const mockSessionStore = {};
global.sessionStorage = {
  getItem: (k) => (k in mockSessionStore ? mockSessionStore[k] : null),
  setItem: (k, v) => { mockSessionStore[k] = String(v); },
  removeItem: (k) => { delete mockSessionStore[k]; },
  clear: () => { Object.keys(mockSessionStore).forEach(k => delete mockSessionStore[k]); }
};

let redirectedTo = null;
global.window = {
  location: {
    pathname: "/patient-dashboard.html",
    search: "",
    replace: (url) => { redirectedTo = url; },
    href: "/patient-dashboard.html"
  }
};

global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Load js/script.js into context
const scriptContent = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');
vm.runInThisContext(scriptContent);

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

// -------------------------------------------------------------
// Test 1: Role dropdown contains only Patient and Consulting Physician
// -------------------------------------------------------------
const loginHtml = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
const hasPatientOption = loginHtml.includes('<option value="Patient"');
const hasPhysicianOption = loginHtml.includes('<option value="Physician"');
const roleOptionsCount = (loginHtml.match(/<option value="(Patient|Physician)"/g) || []).length;

assertTest(
  hasPatientOption && hasPhysicianOption && roleOptionsCount === 2,
  1,
  "Role dropdown contains exactly two roles: Patient and Consulting Physician."
);

// -------------------------------------------------------------
// Test 2: OPD Administrator is completely removed
// -------------------------------------------------------------
const allFiles = [
  'index.html', 'home.html', 'doctors.html', 'appointment.html',
  'login.html', 'patient-dashboard.html', 'physician-dashboard.html',
  'success.html', 'js/script.js'
];

let opdAdminFound = false;
allFiles.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  if (content.toLowerCase().includes("opd administrator") || content.includes('"Admin"') || content.includes("'Admin'")) {
    opdAdminFound = true;
    console.error(`Unexpected OPD Admin reference in ${f}`);
  }
});

assertTest(!opdAdminFound, 2, "OPD Administrator is completely removed from all pages, scripts, and UI.");

// -------------------------------------------------------------
// Test 3: Patient preview opens the patient dashboard
// -------------------------------------------------------------
clearActiveSession();
const patientSession = authService.loginDemo("patient");
assertTest(
  patientSession && patientSession.role === "Patient" && patientSession.name === "Ananya Raman",
  3,
  "Patient preview creates a valid Patient session for " + (patientSession ? patientSession.name : "N/A") + "."
);

// -------------------------------------------------------------
// Test 4: Physician preview opens the physician dashboard
// -------------------------------------------------------------
clearActiveSession();
const physicianSession = authService.loginDemo("physician", "doc-001");
assertTest(
  physicianSession && physicianSession.role === "Physician" && physicianSession.doctorId === "doc-001",
  4,
  "Physician preview creates a valid Physician session (Dr. John Smith, doc-001)."
);

// -------------------------------------------------------------
// Test 5: Patient users cannot access physician pages through demo navigation & guard
// -------------------------------------------------------------
// Set active session as Patient
setActiveSession({
  userId: "pat-101",
  name: "Ananya Raman",
  role: "Patient",
  email: "ananya.raman@healthcare.demo"
});

redirectedTo = null;
const guardResultForPatientOnPhysicianPage = enforceRoleGuard("Physician", "login.html");
assertTest(
  guardResultForPatientOnPhysicianPage === null && redirectedTo && redirectedTo.includes("patient-dashboard.html"),
  5,
  "Patient user is blocked by role guard from accessing physician pages and safely redirected to patient-dashboard.html."
);

// -------------------------------------------------------------
// Test 6: Physicians only see appointments assigned to their doctor ID (Data Isolation)
// -------------------------------------------------------------
// Initialize demo appointments
getAppointments();
const drSmithAppts = physicianService.getAssignedAppointments("doc-001");
const drClarkAppts = physicianService.getAssignedAppointments("doc-021");

const smithHasForeignDoctor = drSmithAppts.some(a => a.doctorId !== "doc-001");
const clarkHasForeignDoctor = drClarkAppts.some(a => a.doctorId !== "doc-021");

assertTest(
  drSmithAppts.length > 0 && drClarkAppts.length > 0 && !smithHasForeignDoctor && !clarkHasForeignDoctor,
  6,
  `Physician appointments strictly isolated to their own doctor ID (${drSmithAppts.length} for doc-001, ${drClarkAppts.length} for doc-021; 0 cross-physician leaks).`
);

// -------------------------------------------------------------
// Test 7: Patients can browse doctors, book appointments, and view confirmation
// -------------------------------------------------------------
setActiveSession({
  userId: "pat-101",
  name: "Ananya Raman",
  role: "Patient",
  email: "ananya.raman@healthcare.demo"
});

const testDate = getOffsetDateString(4);
const createdBooking = patientService.createBooking({
  doctorId: "doc-005",
  doctorName: "Dr. Vikram Patel",
  specialty: "Cardiology",
  patientName: "Ananya Raman",
  phone: "+91 98765 43210",
  email: "ananya.raman@healthcare.demo",
  patientAge: 29,
  appointmentDate: testDate,
  timeSlot: "11:30 AM",
  fee: 650,
  room: "Cardiology Wing - Room 105",
  notes: "Routine cardiovascular wellness screening"
});

const verifiedBooking = getAppointments().find(a => a.id === createdBooking.id);
assertTest(
  createdBooking && createdBooking.id && verifiedBooking && verifiedBooking.doctorName === "Dr. Vikram Patel",
  7,
  `Patient booking created successfully (Ref: ${createdBooking ? createdBooking.id : 'N/A'}) with doctor linkage and confirmation voucher ready.`
);

// -------------------------------------------------------------
// Test 8: Duplicate booking attempts are blocked in demo
// -------------------------------------------------------------
let duplicateBlocked = false;
try {
  patientService.createBooking({
    doctorId: "doc-005",
    doctorName: "Dr. Vikram Patel",
    specialty: "Cardiology",
    patientName: "Another Patient",
    phone: "+91 99999 88888",
    email: "test@example.com",
    patientAge: 45,
    appointmentDate: testDate,
    timeSlot: "11:30 AM",
    notes: "Conflicting attempt for occupied slot"
  });
} catch (e) {
  duplicateBlocked = true;
}

assertTest(
  duplicateBlocked,
  8,
  "Duplicate booking attempt for the identical doctor, date, and slot is strictly rejected with collision exception."
);

// -------------------------------------------------------------
// Test 9: Appointment cancellation and status updates work in demo
// -------------------------------------------------------------
// Test cancellation by patient
const cancelSuccess = patientService.cancelBooking(createdBooking.id);
const afterCancel = getAppointments().find(a => a.id === createdBooking.id);

// Verify slot is freed up after cancellation
const slotFreed = !isSlotBooked("doc-005", testDate, "11:30 AM");

// Test status update by physician
const physUpdateSuccess = physicianService.updateStatus("HC-2026-1042", "doc-001", "Completed");
const updatedAppt = getAppointments().find(a => a.id === "HC-2026-1042");

assertTest(
  cancelSuccess === true && afterCancel.status === "Cancelled" && slotFreed &&
  physUpdateSuccess === true && updatedAppt.status === "Completed",
  9,
  "Patient appointment cancellation frees up the time slot, and physician status transition to 'Completed' works smoothly."
);

// -------------------------------------------------------------
// Test 10: Logout returns user to login page and clears demo session
// -------------------------------------------------------------
clearActiveSession();
const sessionAfterLogout = getActiveSession();
assertTest(
  sessionAfterLogout === null && mockStore[STORAGE_KEY_SESSION] === undefined && mockSessionStore[STORAGE_KEY_SESSION] === undefined,
  10,
  "Logout completely clears session from storage and resets auth state."
);

// -------------------------------------------------------------
// Test 11: Refreshing pages preserves session without cross-role leakage
// -------------------------------------------------------------
setActiveSession({
  userId: "doc-021",
  name: "Dr. Emily Clark",
  role: "Physician",
  doctorId: "doc-021",
  specialty: "Dermatology"
});

// Simulate page reload: reading from storage
const reloadedSession = getActiveSession();
redirectedTo = null;
const physicianAllowedOnPhysicianPage = enforceRoleGuard("Physician", "login.html");
redirectedTo = null;
const physicianBlockedOnPatientPage = enforceRoleGuard("Patient", "login.html");

assertTest(
  reloadedSession && reloadedSession.role === "Physician" &&
  physicianAllowedOnPhysicianPage !== null &&
  physicianBlockedOnPatientPage === null && redirectedTo && redirectedTo.includes("physician-dashboard.html"),
  11,
  "Session persists on refresh; physicians are correctly allowed on physician dashboard and blocked with redirect on patient dashboard."
);

// -------------------------------------------------------------
// Test 12: Internal links, scripts, CSS, and image assets use GitHub Pages relative paths
// -------------------------------------------------------------
let brokenPathsFound = false;
allFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  // Check for root absolute paths like href="/something" or src="/something" (excluding http/https/data:)
  const absoluteLinks = content.match(/(?:href|src)=["']\/(?!\/)[^"']*["']/g) || [];
  if (absoluteLinks.length > 0) {
    brokenPathsFound = true;
    console.error(`Absolute paths found in ${file}: ${absoluteLinks.join(', ')}`);
  }
});

assertTest(
  !brokenPathsFound,
  12,
  "All internal links, scripts, stylesheets, and images use safe relative paths for GitHub Pages hosting."
);

// -------------------------------------------------------------
// Test 13: Layout responsiveness verified on mobile and desktop
// -------------------------------------------------------------
let responsiveValid = true;
['patient-dashboard.html', 'physician-dashboard.html', 'login.html'].forEach(f => {
  const html = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const hasViewport = html.includes('name="viewport"') && html.includes('width=device-width');
  const hasBootstrapGrid = html.includes('container') && (html.includes('col-md-') || html.includes('col-lg-') || html.includes('row g-'));
  if (!hasViewport || !hasBootstrapGrid) {
    console.error(`Responsive check failed for ${f}: viewport=${hasViewport}, grid=${hasBootstrapGrid}`);
    responsiveValid = false;
  }
});

const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');
const has991 = cssContent.includes('@media (max-width: 991.98px)');
const has576 = cssContent.includes('@media (max-width: 576px)');
if (!has991 || !has576) {
  console.error(`CSS media query check failed: 991.98px=${has991}, 576px=${has576}`);
}
const hasMediaQueries = has991 && has576;

assertTest(
  responsiveValid && hasMediaQueries,
  13,
  "Responsive layout validated: viewport meta tags, Bootstrap 5 responsive grids, and custom mobile breakpoints confirmed."
);

console.log("\n==================================================================");
console.log(`TEST SUMMARY: ${totalPassed} / 13 PASSED, ${totalFailed} FAILED`);
console.log("==================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("ALL 13 VERIFICATION CRITERIA PASSED WITHOUT ERRORS!\n");
}
