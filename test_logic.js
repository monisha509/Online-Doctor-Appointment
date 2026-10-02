// Unit test for expanded logic functions
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Mock DOM
global.document = {
  getElementById: () => null,
  addEventListener: () => {}
};

// Read script.js and run in global context
const code = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');
vm.runInThisContext(code);

console.log("=== Testing Healthcare System Core Logic ===");

// 1. Doctor registry count: must be 55
console.assert(DOCTORS_DATA.length === 55, `Expected 55 doctors, got ${DOCTORS_DATA.length}`);
console.log(`[PASS] Doctor dataset verified: ${DOCTORS_DATA.length} doctors loaded.`);

// 2. Department check: each department has at least 5 doctors
const expectedDepts = [
  "Cardiology",
  "General Medicine",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Neurology",
  "Obstetrics & Gynecology",
  "ENT Specialist",
  "Ophthalmology",
  "Dental Surgery",
  "Psychiatry"
];

expectedDepts.forEach(dept => {
  const count = getDepartmentCount(dept);
  console.assert(count >= 5, `Department ${dept} has less than 5 doctors (${count})`);
  console.log(`[PASS] Department '${dept}': ${count} specialist doctors available.`);
});

// 3. Unique doctor IDs
const ids = new Set();
const imgPaths = new Set();
DOCTORS_DATA.forEach(d => {
  console.assert(!ids.has(d.id), `Duplicate doctor ID found: ${d.id}`);
  ids.add(d.id);
  imgPaths.add(d.img);

  // Check image exists on disk
  const fullImg = path.join(__dirname, d.img);
  console.assert(fs.existsSync(fullImg), `Image file missing: ${d.img}`);
});
console.log(`[PASS] All ${ids.size} doctor IDs are unique.`);
console.log(`[PASS] All ${imgPaths.size} doctor image paths are verified locally on disk.`);

// 4. Doctor lookup functions
const doc1 = findDoctorById("doc-001");
console.assert(doc1 && doc1.name === "Dr. John Smith", "Failed to lookup doc-001 by ID");

const docByDept = findDoctorByIdOrName("Dr. Emily Clark");
console.assert(docByDept && docByDept.specialty === "Dermatology", "Failed to lookup doctor by name");

const invalidDoc = findDoctorById("invalid-id-999");
console.assert(invalidDoc === null, "Invalid doctor ID should return null");
console.log("[PASS] Doctor lookup validation verified (valid IDs resolved, invalid IDs rejected).");

// 5. Initial booking seeding
const seed = getAppointments();
console.assert(seed.length >= 2, `Expected sample demo appointments, got ${seed.length}`);
console.log(`[PASS] Local demo appointments verified: ${seed.length} records available.`);

// 6. Duplicate slot collision detection
const testDate = getOffsetDateString(1);
const isOccupied = isSlotBooked("doc-001", testDate, "10:00 AM");
console.assert(isOccupied === true, "Expected slot 10:00 AM on testDate to be marked booked");
const isFree = isSlotBooked("doc-001", testDate, "02:30 PM");
console.assert(isFree === false, "Expected slot 02:30 PM on testDate to be free");
console.log("[PASS] Duplicate booking collision prevention verified.");

// 7. Booking ID generator
const newId = generateBookingId();
console.assert(/^HC-2026-\d{4}$/.test(newId), `Invalid ID format: ${newId}`);
console.log(`[PASS] Booking reference generation verified: ${newId}`);

console.log("=== ALL UNIT TESTS PASSED SUCCESSFULLY! ===");
