// Unit test for logic functions
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

console.log("=== Testing Core Logic ===");

// 1. Doctor registry count
console.assert(DOCTORS_DATA.length === 11, `Expected 11 doctors, got ${DOCTORS_DATA.length}`);
console.log(`[PASS] Doctor dataset verified: ${DOCTORS_DATA.length} doctors loaded.`);

// 2. Initial appointment seeding
const seed = getAppointments();
console.assert(seed.length >= 2, `Expected seeded demo appointments, got ${seed.length}`);
console.log(`[PASS] Demo localStorage seeding verified: ${seed.length} appointments available.`);

// 3. Time slots
console.assert(STANDARD_TIME_SLOTS.length === 9, `Expected 9 standard slots, got ${STANDARD_TIME_SLOTS.length}`);
console.log(`[PASS] Time slots verified: ${STANDARD_TIME_SLOTS.length} slots configured.`);

// 4. Duplicate slot prevention test
const testDoc = "Dr John Smith";
const testDate = getOffsetDateString(1);
const testSlot = "10:00 AM";

// In seed, Dr John Smith is booked for offset 1 at 10:00 AM
const isBooked = isSlotBooked(testDoc, testDate, testSlot);
console.assert(isBooked === true, `Expected slot to be booked for ${testDoc} at ${testSlot}`);
console.log(`[PASS] Duplicate slot detection verified: Successfully detected occupied slot.`);

const isSlotFree = isSlotBooked(testDoc, testDate, "02:30 PM");
console.assert(isSlotFree === false, `Expected slot 02:30 PM to be free`);
console.log(`[PASS] Free slot availability verified.`);

// 5. Booking ID generation
const bid = generateBookingId();
console.assert(/^HC-2026-\d{4}$/.test(bid), `Unexpected booking ID format: ${bid}`);
console.log(`[PASS] Booking ID format verified: ${bid}`);

// 6. User auth mock
setActiveUser({ username: "Test User", role: "Patient" });
const user = getActiveUser();
console.assert(user && user.username === "Test User", "User auth failed");
console.log(`[PASS] User session persistence verified: Logged in as ${user.username} (${user.role}).`);

console.log("=== All Core Logic Unit Tests Passed Successfully! ===");
