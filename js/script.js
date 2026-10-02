/**
 * HEALTHCARE APPOINTMENT SYSTEM - CORE LOGIC
 * Reusable data models, localStorage demo persistence, validation, and UI interactivity.
 * Safe for client-side portfolio demonstration & GitHub Pages deployment.
 */

// 1. DOCTORS REGISTRY (Preserves existing image files and original names)
const DOCTORS_DATA = [
  {
    id: "doc-1",
    name: "Dr John Smith",
    specialty: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experience: "14+ Years",
    fee: 700,
    availability: "Mon - Fri (09:00 AM - 05:00 PM)",
    img: "images/doctor1.jpg",
    bio: "Consultant interventional cardiologist specializing in cardiovascular health, preventive cardiology, and hypertension management."
  },
  {
    id: "doc-2",
    name: "Dr David Wilson",
    specialty: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experience: "10+ Years",
    fee: 500,
    availability: "Mon - Sat (08:30 AM - 04:00 PM)",
    img: "images/doctor2.jpg",
    bio: "Senior physician providing comprehensive diagnosis and clinical care for chronic illnesses, seasonal infections, and wellness screenings."
  },
  {
    id: "doc-3",
    name: "Dr Michael Brown",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experience: "12+ Years",
    fee: 650,
    availability: "Tue - Sat (10:00 AM - 06:00 PM)",
    img: "images/doctor3.jpg",
    bio: "Orthopedic surgeon specializing in joint replacement, sports injury rehab, and degenerative spine conditions."
  },
  {
    id: "doc-4",
    name: "Dr Robert Miller",
    specialty: "Neurology",
    qualification: "MBBS, DM (Neurology)",
    experience: "15+ Years",
    fee: 800,
    availability: "Mon - Thu (09:30 AM - 04:30 PM)",
    img: "images/doctor4.jpg",
    bio: "Expert neurologist focused on headache disorders, peripheral neuropathy, and neurological rehabilitation."
  },
  {
    id: "doc-5",
    name: "Dr James Anderson",
    specialty: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics), DCH",
    experience: "9+ Years",
    fee: 550,
    availability: "Mon - Sat (09:00 AM - 03:00 PM)",
    img: "images/doctor5.jpg",
    bio: "Dedicated pediatrician managing newborn care, childhood immunizations, developmental milestones, and acute pediatric ailments."
  },
  {
    id: "doc-6",
    name: "Dr Emily Clark",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    experience: "8+ Years",
    fee: 600,
    availability: "Wed - Sun (11:00 AM - 06:00 PM)",
    img: "images/doctor6.jpg",
    bio: "Clinical dermatologist experienced in acne care, allergic skin diseases, laser therapy, and advanced dermatological solutions."
  },
  {
    id: "doc-7",
    name: "Dr Olivia Davis",
    specialty: "Obstetrics & Gynecology",
    qualification: "MBBS, MS (OBG), DGO",
    experience: "11+ Years",
    fee: 700,
    availability: "Mon - Fri (10:00 AM - 05:00 PM)",
    img: "images/doctor7.jpg",
    bio: "Women's health specialist handling prenatal guidance, maternal wellness, hormonal balance, and gynecological care."
  },
  {
    id: "doc-8",
    name: "Dr Sophia Taylor",
    specialty: "ENT Specialist",
    qualification: "MBBS, MS (ENT)",
    experience: "7+ Years",
    fee: 500,
    availability: "Mon - Sat (09:00 AM - 02:00 PM)",
    img: "images/doctor8.jpg",
    bio: "Otolaryngologist providing care for sinusitis, hearing conditions, tonsillitis, and sleep apnea evaluation."
  },
  {
    id: "doc-9",
    name: "Dr Ava Martinez",
    specialty: "Ophthalmology",
    qualification: "MBBS, MS (Ophthalmology)",
    experience: "13+ Years",
    fee: 600,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor9.jpg",
    bio: "Comprehensive eye care consultant focusing on cataract assessment, refractive errors, and diabetic retinopathy screening."
  },
  {
    id: "doc-10",
    name: "Dr Isabella Thomas",
    specialty: "Dental Surgery",
    qualification: "BDS, MDS (Oral Surgery)",
    experience: "6+ Years",
    fee: 450,
    availability: "Tue - Sun (10:00 AM - 07:00 PM)",
    img: "images/doctor10.jpg",
    bio: "Dental surgeon offering root canal treatments, aesthetic dental restorations, and routine oral hygiene care."
  },
  {
    id: "doc-11",
    name: "Dr Mia White",
    specialty: "Psychiatry",
    qualification: "MBBS, MD (Psychiatry)",
    experience: "10+ Years",
    fee: 750,
    availability: "Mon - Fri (02:00 PM - 07:00 PM)",
    img: "images/doctor11.jpg",
    bio: "Consultant psychiatrist dedicated to adult behavioral health, stress management, anxiety relief, and cognitive wellbeing."
  }
];

// 2. TIME SLOTS CONFIGURATION
const STANDARD_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:15 AM",
  "12:00 PM",
  "02:30 PM",
  "03:30 PM",
  "04:30 PM",
  "05:30 PM",
  "06:30 PM"
];

// 3. LOCAL STORAGE KEYS
const STORAGE_KEY_APPOINTMENTS = "healthcare_appointments_demo";
const STORAGE_KEY_USER = "healthcare_active_user_demo";

// 4. STORAGE ACCESS & INITIALIZATION
function getAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) {
      // Seed with initial realistic demo bookings for presentation
      const initialBookings = [
        {
          id: "HC-2026-1042",
          patientName: "Rahul Sharma",
          email: "rahul.demo@hospital.com",
          phone: "+91 98401 23456",
          doctorName: "Dr John Smith",
          specialty: "Cardiology",
          appointmentDate: getOffsetDateString(1),
          timeSlot: "10:00 AM",
          status: "Confirmed",
          fee: 700,
          notes: "Routine quarterly cardiovascular review.",
          createdAt: new Date().toISOString()
        },
        {
          id: "HC-2026-1043",
          patientName: "Priya Venkatesh",
          email: "priya.demo@hospital.com",
          phone: "+91 98402 34567",
          doctorName: "Dr Emily Clark",
          specialty: "Dermatology",
          appointmentDate: getOffsetDateString(2),
          timeSlot: "11:15 AM",
          status: "Confirmed",
          fee: 600,
          notes: "Follow up consultation for skin allergy.",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(initialBookings));
      return initialBookings;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading localStorage appointments:", err);
    return [];
  }
}

function saveAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  } catch (err) {
    console.error("Error saving appointments:", err);
  }
}

function getActiveUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setActiveUser(userObj) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
  } catch (e) {
    console.error("Error setting active user:", e);
  }
}

function clearActiveUser() {
  localStorage.removeItem(STORAGE_KEY_USER);
}

// 5. HELPER UTILITIES
function getOffsetDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayDateString() {
  return getOffsetDateString(0);
}

function generateBookingId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HC-${new Date().getFullYear()}-${rand}`;
}

// Duplicate slot check
function isSlotBooked(doctorName, date, slot, excludeBookingId = null) {
  const list = getAppointments();
  return list.some(item => 
    item.doctorName.toLowerCase() === doctorName.toLowerCase() &&
    item.appointmentDate === date &&
    item.timeSlot === slot &&
    item.status !== "Cancelled" &&
    item.id !== excludeBookingId
  );
}

// Doctor lookup
function findDoctorByName(name) {
  if (!name) return null;
  return DOCTORS_DATA.find(d => d.name.trim().toLowerCase() === name.trim().toLowerCase());
}

// 6. GLOBAL NAVBAR & USER SESSION SYNC
function syncNavbarUserStatus() {
  const user = getActiveUser();
  const userSlot = document.getElementById("navbarUserSlot");
  if (!userSlot) return;

  if (user && user.username) {
    userSlot.innerHTML = `
      <div class="dropdown d-inline-block">
        <button class="btn btn-sm btn-light border dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-check-fill text-primary"></i>
          <span>${escapeHtml(user.username)}</span>
          <span class="badge bg-secondary-subtle text-secondary ms-1">${escapeHtml(user.role || 'Patient')}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><h6 class="dropdown-header">Demo Session Active</h6></li>
          <li><a class="dropdown-item" href="javascript:void(0)" onclick="openMyAppointmentsModal()"><i class="bi bi-calendar3 me-2"></i>My Appointments</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Log Out (Clear Demo)</a></li>
        </ul>
      </div>
    `;
  } else {
    userSlot.innerHTML = `
      <a href="login.html" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
        <i class="bi bi-box-arrow-in-right"></i>
        <span>Demo Login</span>
      </a>
    `;
  }
}

function handleLogout() {
  clearActiveUser();
  alert("Logged out of demo session.");
  window.location.reload();
}

// HTML escape helper to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 7. "MY APPOINTMENTS" MODAL SYSTEM
function openMyAppointmentsModal() {
  let modalEl = document.getElementById("myAppointmentsModal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "myAppointmentsModal";
    modalEl.className = "modal fade";
    modalEl.tabIndex = -1;
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-navy text-white" style="background:#0f2e59; color:white;">
            <h5 class="modal-title fw-bold text-white"><i class="bi bi-calendar-check me-2"></i>My Booked Appointments (Demo Store)</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" id="modalAppointmentsBody">
            <!-- Dynamically populated -->
          </div>
          <div class="modal-footer bg-light">
            <span class="text-muted small me-auto"><i class="bi bi-info-circle me-1"></i>Saved in browser localStorage for demo review.</span>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <a href="appointment.html" class="btn btn-primary"><i class="bi bi-plus-circle me-1"></i>Book New</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  renderModalAppointments();
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

function renderModalAppointments() {
  const container = document.getElementById("modalAppointmentsBody");
  if (!container) return;

  const bookings = getAppointments();
  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 fw-bold text-secondary">No Appointments Found</h5>
        <p class="text-muted small">You haven't scheduled any doctor consultations yet.</p>
        <a href="doctors.html" class="btn btn-primary mt-2">Find a Doctor</a>
      </div>
    `;
    return;
  }

  // Sort newest first
  const sorted = [...bookings].reverse();
  let html = `
    <div class="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-shield-check fs-5"></i>
      <div><strong>Demo Storage Notice:</strong> These records reflect local demonstration data. In a full production system, bookings synchronize with a secure backend API and database.</div>
    </div>
  `;

  sorted.forEach(item => {
    const isCancelled = item.status === "Cancelled";
    html += `
      <div class="appointment-list-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 mb-3 ${isCancelled ? 'opacity-75 bg-light' : 'bg-white'}">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${isCancelled ? 'bg-danger' : 'bg-success'}">${escapeHtml(item.status)}</span>
            <span class="fw-bold text-primary font-monospace">${escapeHtml(item.id)}</span>
          </div>
          <h5 class="mb-1 mt-2 fw-bold text-navy">${escapeHtml(item.doctorName)}</h5>
          <div class="text-muted small">
            <span class="text-teal fw-semibold">${escapeHtml(item.specialty)}</span> &bull; 
            <i class="bi bi-person me-1"></i>Patient: <strong>${escapeHtml(item.patientName)}</strong> &bull; 
            <i class="bi bi-telephone me-1"></i>${escapeHtml(item.phone)}
          </div>
          <div class="mt-2 text-secondary small">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
              <i class="bi bi-calendar-event me-1"></i>${escapeHtml(item.appointmentDate)}
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
              <i class="bi bi-clock me-1"></i>${escapeHtml(item.timeSlot)}
            </span>
            <span class="text-muted">Fee: ₹${escapeHtml(String(item.fee || '500'))}</span>
          </div>
          ${item.notes ? `<div class="mt-1 text-muted small fst-italic">Note: "${escapeHtml(item.notes)}"</div>` : ''}
        </div>
        <div class="d-flex flex-md-column gap-2 text-end">
          <a href="success.html?bookingId=${encodeURIComponent(item.id)}" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-receipt me-1"></i>View Slip
          </a>
          ${!isCancelled ? `
            <button class="btn btn-outline-danger btn-sm" onclick="cancelAppointment('${escapeHtml(item.id)}')">
              <i class="bi bi-x-circle me-1"></i>Cancel
            </button>
          ` : `
            <button class="btn btn-outline-secondary btn-sm" onclick="deleteAppointmentRecord('${escapeHtml(item.id)}')">
              <i class="bi bi-trash me-1"></i>Remove
            </button>
          `}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function cancelAppointment(bookingId) {
  if (!confirm(`Are you sure you want to cancel appointment ${bookingId}?`)) return;

  const bookings = getAppointments();
  const updated = bookings.map(b => {
    if (b.id === bookingId) {
      return { ...b, status: "Cancelled" };
    }
    return b;
  });

  saveAppointments(updated);
  renderModalAppointments();
}

function deleteAppointmentRecord(bookingId) {
  if (!confirm(`Remove record ${bookingId} from history?`)) return;

  const bookings = getAppointments();
  const updated = bookings.filter(b => b.id !== bookingId);
  saveAppointments(updated);
  renderModalAppointments();
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  syncNavbarUserStatus();
});