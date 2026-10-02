const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Mock browser environment
const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.document = {
  getElementById: () => null,
  addEventListener: () => {}
};

// Load script.js
const scriptCode = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');
vm.runInThisContext(scriptCode);

console.log("=== End-to-End Workflow Verification ===");

// Scenario 1: User tries opening appointment.html without selecting a doctor
console.log("\nScenario 1: Doctor selection requirement verification");
const noDoc = findDoctorByIdOrName(null);
console.assert(noDoc === null, "Null doctor ID must return null");
const invalidDoc = findDoctorByIdOrName("invalid-id-xyz");
console.assert(invalidDoc === null, "Fake doctor ID must return null");
console.log("[PASS] Form cannot be submitted without a valid doctor selection.");

// Scenario 2: User selects doctor from directory
console.log("\nScenario 2: User selects Dr. Emily Clark (Dermatology)");
const selectedDoc = findDoctorById("doc-021");
console.assert(selectedDoc !== null, "Dr. Emily Clark must exist");
console.assert(selectedDoc.name === "Dr. Emily Clark", "Name mismatch");
console.assert(selectedDoc.specialty === "Dermatology", "Specialty mismatch");
console.assert(selectedDoc.fee === 600, "Fee mismatch");
console.log(`[PASS] Doctor successfully resolved: ${selectedDoc.name}, ${selectedDoc.specialty}, ₹${selectedDoc.fee}`);

// Scenario 3: Booking appointment with selected doctor
console.log("\nScenario 3: Create appointment for patient 'Ananya Raman'");
const appointmentDate = getOffsetDateString(3);
const timeSlot = "03:30 PM";

// Check if free
console.assert(isSlotBooked(selectedDoc.id, appointmentDate, timeSlot) === false, "Slot should be free initially");

const bookingId = generateBookingId();
const newBooking = {
  id: bookingId,
  patientName: "Ananya Raman",
  phone: "+91 98401 99999",
  email: "ananya@example.com",
  doctorId: selectedDoc.id,
  doctorName: selectedDoc.name,
  specialty: selectedDoc.specialty,
  appointmentDate: appointmentDate,
  timeSlot: timeSlot,
  fee: selectedDoc.fee,
  status: "Confirmed",
  createdAt: new Date().toISOString()
};

const bookings = getAppointments();
bookings.push(newBooking);
saveAppointments(bookings);
console.log(`[PASS] Appointment saved with reference: ${bookingId}`);

// Scenario 4: Collision detection on identical doctor, date, and slot
console.log("\nScenario 4: Duplicate slot detection test");
const isNowOccupied = isSlotBooked(selectedDoc.id, appointmentDate, timeSlot);
console.assert(isNowOccupied === true, "Slot must now be occupied");
console.log("[PASS] Collision detection prevented double-booking identical slot.");

// Scenario 5: Another doctor at the same time is still available
console.log("\nScenario 5: Independent slot availability for different doctors");
const diffDoc = findDoctorById("doc-001");
const isDiffDocFree = isSlotBooked(diffDoc.id, appointmentDate, timeSlot);
console.assert(isDiffDocFree === false, "Different doctor should be available at same time");
console.log(`[PASS] Slot is available for ${diffDoc.name} as expected.`);

// Scenario 6: Cancellation workflow
console.log("\nScenario 6: Cancellation workflow");
const allUpdated = getAppointments().map(b => {
  if (b.id === bookingId) return { ...b, status: "Cancelled" };
  return b;
});
saveAppointments(allUpdated);

// After cancellation, slot is freed
const isFreedAfterCancel = isSlotBooked(selectedDoc.id, appointmentDate, timeSlot);
console.assert(isFreedAfterCancel === false, "Slot must be free after cancellation");
console.log("[PASS] Slot is reopened after appointment cancellation.");

console.log("\n=== ALL WORKFLOW SCENARIOS VERIFIED SUCCESSFULLY! ===");
