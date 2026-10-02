/**
 * HEALTHCARE APPOINTMENT SYSTEM - CENTRAL APPLICATION LOGIC
 * - 55-doctor registry across 11 clinical departments
 * - Two-role architecture: Patient and Consulting Physician (OPD Admin completely removed)
 * - Session handling and client-side demo preview mode
 * - Isolated appointment queries by doctorId (physicians only see their own appointments)
 * - Backend-ready service modules with documented placeholder REST endpoints
 */

// ============================================================================
// 1. COMPREHENSIVE DOCTOR REGISTRY (5 Doctors x 11 Departments = 55 Doctors)
// ============================================================================
const DOCTORS_DATA = [
  // --- CARDIOLOGY (5 Doctors) ---
  {
    id: "doc-001",
    name: "Dr. John Smith",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology), FACC",
    experience: "14+ Years",
    fee: 700,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor_001.jpg",
    room: "Cardiology Wing - Room 101",
    languages: "English, Hindi",
    email: "dr.johnsmith@healthcare.demo",
    bio: "Consultant interventional cardiologist specializing in coronary interventions, preventive cardiovascular screening, and hypertension management."
  },
  {
    id: "doc-002",
    name: "Dr. Ananya Sen",
    specialty: "Cardiology",
    qualification: "MBBS, MD (Medicine), DNB (Cardiology)",
    experience: "11+ Years",
    fee: 750,
    availability: "Mon - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_002.jpg",
    room: "Cardiology Wing - Room 102",
    languages: "English, Bengali, Hindi",
    email: "dr.ananyasen@healthcare.demo",
    bio: "Cardiovascular specialist focused on non-invasive echocardiography, heart failure therapy, and lipid management."
  },
  {
    id: "doc-003",
    name: "Dr. Vikram Malhotra",
    specialty: "Cardiology",
    qualification: "MBBS, MS, MCh (Cardiothoracic Surgery)",
    experience: "16+ Years",
    fee: 800,
    availability: "Tue - Sat (08:30 AM - 03:30 PM)",
    img: "images/doctor_003.jpg",
    room: "Cardiology Wing - Room 103",
    languages: "English, Hindi, Punjabi",
    email: "dr.vikrammalhotra@healthcare.demo",
    bio: "Senior clinical cardiologist managing valvular heart conditions, adult congenital heart diseases, and post-angioplasty care."
  },
  {
    id: "doc-004",
    name: "Dr. Rebecca Foster",
    specialty: "Cardiology",
    qualification: "MD, MRCP (Cardiology), Fellowship Electrophysiology",
    experience: "9+ Years",
    fee: 650,
    availability: "Mon - Thu (10:00 AM - 04:30 PM)",
    img: "images/doctor_004.jpg",
    room: "Cardiology Wing - Room 104",
    languages: "English, French",
    email: "dr.rebeccafoster@healthcare.demo",
    bio: "Cardiac electrophysiology specialist treating arrhythmias, palpitations, syncope evaluations, and pacemaker programming."
  },
  {
    id: "doc-005",
    name: "Dr. Arun Prakash",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DNB (Cardiology), FCSI",
    experience: "12+ Years",
    fee: 700,
    availability: "Wed - Sun (09:00 AM - 03:00 PM)",
    img: "images/doctor_005.jpg",
    room: "Cardiology Wing - Room 105",
    languages: "English, Tamil, Telugu",
    email: "dr.arunprakash@healthcare.demo",
    bio: "Specialist in preventive cardiovascular disease, lifestyle cardiology, exercise stress testing, and vascular health."
  },

  // --- GENERAL MEDICINE (5 Doctors) ---
  {
    id: "doc-006",
    name: "Dr. David Wilson",
    specialty: "General Medicine",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: "10+ Years",
    fee: 500,
    availability: "Mon - Sat (08:30 AM - 04:00 PM)",
    img: "images/doctor_006.jpg",
    room: "OPD Complex A - Room 201",
    languages: "English, Spanish",
    email: "dr.davidwilson@healthcare.demo",
    bio: "Primary care physician managing chronic medical disorders, seasonal viral illnesses, metabolic syndrome, and routine wellness checkups."
  },
  {
    id: "doc-007",
    name: "Dr. Shalini Sundaram",
    specialty: "General Medicine",
    qualification: "MBBS, DNB (Family Medicine), Dip. Diabetology",
    experience: "8+ Years",
    fee: 450,
    availability: "Mon - Fri (09:00 AM - 05:00 PM)",
    img: "images/doctor_007.jpg",
    room: "OPD Complex A - Room 202",
    languages: "English, Tamil, Malayalam",
    email: "dr.shalinisundaram@healthcare.demo",
    bio: "Family physician offering thorough clinical evaluations for fever, respiratory infections, hypertension, and preventive health screenings."
  },
  {
    id: "doc-008",
    name: "Dr. Kevin Patel",
    specialty: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experience: "13+ Years",
    fee: 550,
    availability: "Mon - Sat (10:00 AM - 06:00 PM)",
    img: "images/doctor_008.jpg",
    room: "OPD Complex A - Room 203",
    languages: "English, Gujarati, Hindi",
    email: "dr.kevinpatel@healthcare.demo",
    bio: "Senior physician specializing in infectious diseases, adult immunizations, geriatric medicine, and complex diagnostic workups."
  },
  {
    id: "doc-009",
    name: "Dr. Maria Santos",
    specialty: "General Medicine",
    qualification: "MD, Dip. Clinical Endocrinology",
    experience: "7+ Years",
    fee: 500,
    availability: "Tue - Sun (09:00 AM - 03:00 PM)",
    img: "images/doctor_009.jpg",
    room: "OPD Complex A - Room 204",
    languages: "English, Portuguese",
    email: "dr.mariasantos@healthcare.demo",
    bio: "Dedicated internist focusing on thyroid disorders, metabolic health, nutritional deficiencies, and outpatient medical therapy."
  },
  {
    id: "doc-010",
    name: "Dr. Rajesh Mukherjee",
    specialty: "General Medicine",
    qualification: "MBBS, MD, FICP (Consultant Physician)",
    experience: "18+ Years",
    fee: 600,
    availability: "Mon - Fri (08:00 AM - 02:00 PM)",
    img: "images/doctor_010.jpg",
    room: "OPD Complex A - Room 205",
    languages: "English, Bengali, Hindi",
    email: "dr.rajeshmukherjee@healthcare.demo",
    bio: "Veteran consultant physician providing multi-system illness management, critical illness follow-up, and preventive geriatric care."
  },

  // --- ORTHOPEDICS (5 Doctors) ---
  {
    id: "doc-011",
    name: "Dr. Michael Brown",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics), MCh",
    experience: "12+ Years",
    fee: 650,
    availability: "Tue - Sat (10:00 AM - 06:00 PM)",
    img: "images/doctor_011.jpg",
    room: "Orthopedic Pavilion - Room 301",
    languages: "English, German",
    email: "dr.michaelbrown@healthcare.demo",
    bio: "Orthopedic surgeon specializing in joint reconstruction, arthroscopic knee repairs, sports ligament tears, and post-traumatic injury rehab."
  },
  {
    id: "doc-012",
    name: "Dr. Sandeep Verma",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Ortho), Fellowship Joint Replacement",
    experience: "15+ Years",
    fee: 750,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor_012.jpg",
    room: "Orthopedic Pavilion - Room 302",
    languages: "English, Hindi",
    email: "dr.sandeepverma@healthcare.demo",
    bio: "Subspecialist in primary and revision hip & knee arthroplasty, osteoarthritis management, and advanced joint preservation techniques."
  },
  {
    id: "doc-013",
    name: "Dr. Clara Jensen",
    specialty: "Orthopedics",
    qualification: "MD, Spine Surgery Fellowship",
    experience: "9+ Years",
    fee: 700,
    availability: "Mon - Sat (11:00 AM - 05:30 PM)",
    img: "images/doctor_013.jpg",
    room: "Orthopedic Pavilion - Room 303",
    languages: "English, Danish",
    email: "dr.clarajensen@healthcare.demo",
    bio: "Spine and musculoskeletal consultant addressing cervical disc disease, lumbar sciatica, posture rehabilitation, and spinal ergonomics."
  },
  {
    id: "doc-014",
    name: "Dr. Harish Balaji",
    specialty: "Orthopedics",
    qualification: "MBBS, D.Ortho, Sports Medicine Certified",
    experience: "11+ Years",
    fee: 650,
    availability: "Tue - Sun (08:30 AM - 03:00 PM)",
    img: "images/doctor_014.jpg",
    room: "Orthopedic Pavilion - Room 304",
    languages: "English, Tamil, Telugu",
    email: "dr.harishbalaji@healthcare.demo",
    bio: "Sports injury clinician handling shoulder impingement, rotator cuff injuries, tennis elbow, ankle sprains, and conservative trauma therapy."
  },
  {
    id: "doc-015",
    name: "Dr. Anthony Vance",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Ortho), Pediatric Ortho Fellowship",
    experience: "14+ Years",
    fee: 700,
    availability: "Mon - Fri (10:00 AM - 05:00 PM)",
    img: "images/doctor_015.jpg",
    room: "Orthopedic Pavilion - Room 305",
    languages: "English",
    email: "dr.anthonyvance@healthcare.demo",
    bio: "Specialist managing limb deformities, developmental dysplasia of the hip, clubfoot corrections, and fractures in growing bones."
  },

  // --- PEDIATRICS (5 Doctors) ---
  {
    id: "doc-016",
    name: "Dr. James Anderson",
    specialty: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics), DCH",
    experience: "9+ Years",
    fee: 550,
    availability: "Mon - Sat (09:00 AM - 03:00 PM)",
    img: "images/doctor_016.jpg",
    room: "Child Health Center - Room 401",
    languages: "English",
    email: "dr.jamesanderson@healthcare.demo",
    bio: "Child healthcare physician overseeing newborn wellness examinations, immunization programs, nutritional counseling, and childhood infections."
  },
  {
    id: "doc-017",
    name: "Dr. Meera Krishnan",
    specialty: "Pediatrics",
    qualification: "MBBS, DNB (Pediatrics), Fellowship Neonatology",
    experience: "12+ Years",
    fee: 600,
    availability: "Mon - Fri (09:30 AM - 04:30 PM)",
    img: "images/doctor_017.jpg",
    room: "Child Health Center - Room 402",
    languages: "English, Tamil, Malayalam",
    email: "dr.meerakrishnan@healthcare.demo",
    bio: "Neonatal and infant health specialist managing preterm baby follow-up care, infantile colic, early milestones, and pediatric respiratory allergy."
  },
  {
    id: "doc-018",
    name: "Dr. Lucas Silva",
    specialty: "Pediatrics",
    qualification: "MD (Pediatrics), Child Development Expert",
    experience: "8+ Years",
    fee: 500,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_018.jpg",
    room: "Child Health Center - Room 403",
    languages: "English, Portuguese",
    email: "dr.lucassilva@healthcare.demo",
    bio: "Developmental pediatrician assessing speech delays, childhood attention disorders, behavioral milestones, and growth curve monitoring."
  },
  {
    id: "doc-019",
    name: "Dr. Radhika Joshi",
    specialty: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics), Fellowship Pediatric Pulmonology",
    experience: "14+ Years",
    fee: 650,
    availability: "Mon - Sat (08:30 AM - 02:30 PM)",
    img: "images/doctor_019.jpg",
    room: "Child Health Center - Room 404",
    languages: "English, Marathi, Hindi",
    email: "dr.radhikajoshi@healthcare.demo",
    bio: "Pediatric pulmonology consultant specializing in childhood asthma, recurrent bronchitis, cystic fibrosis, and pediatric allergic rhinitis."
  },
  {
    id: "doc-020",
    name: "Dr. Timothy Campbell",
    specialty: "Pediatrics",
    qualification: "MBBS, DCH, Adolescent Medicine Certified",
    experience: "10+ Years",
    fee: 550,
    availability: "Wed - Sun (11:00 AM - 06:00 PM)",
    img: "images/doctor_020.jpg",
    room: "Child Health Center - Room 405",
    languages: "English",
    email: "dr.timothycampbell@healthcare.demo",
    bio: "Adolescent and school-age clinician focusing on pubertal growth, pediatric obesity, adolescent lifestyle guidance, and acute infectious illnesses."
  },

  // --- DERMATOLOGY (5 Doctors) ---
  {
    id: "doc-021",
    name: "Dr. Emily Clark",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    experience: "8+ Years",
    fee: 600,
    availability: "Wed - Sun (11:00 AM - 06:00 PM)",
    img: "images/doctor_021.jpg",
    room: "Skin & Laser Suite - Room 501",
    languages: "English",
    email: "dr.emilyclark@healthcare.demo",
    bio: "Clinical dermatologist experienced in acne vulgaris treatments, atopic eczema, psoriasis protocols, and clinical dermoscopy evaluations."
  },
  {
    id: "doc-022",
    name: "Dr. Pooja Nair",
    specialty: "Dermatology",
    qualification: "MBBS, DDVL, Aesthetic Dermatology Fellowship",
    experience: "10+ Years",
    fee: 650,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor_022.jpg",
    room: "Skin & Laser Suite - Room 502",
    languages: "English, Malayalam, Hindi",
    email: "dr.poojanair@healthcare.demo",
    bio: "Consultant dermatologist focused on hyperpigmentation, chemical peels, photo-aging reversal, scar revision, and hair loss therapies."
  },
  {
    id: "doc-023",
    name: "Dr. Daniel Kim",
    specialty: "Dermatology",
    qualification: "MD, Clinical Dermatology & Trichology",
    experience: "11+ Years",
    fee: 700,
    availability: "Tue - Sat (10:00 AM - 05:30 PM)",
    img: "images/doctor_023.jpg",
    room: "Skin & Laser Suite - Room 503",
    languages: "English, Korean",
    email: "dr.danielkim@healthcare.demo",
    bio: "Trichology and scalp disorders specialist addressing alopecia areata, androgenetic hair thinning, scalp psoriasis, and nail pathologies."
  },
  {
    id: "doc-024",
    name: "Dr. Sneha Kulkarni",
    specialty: "Dermatology",
    qualification: "MBBS, MD (DVL), Pediatric Dermatology",
    experience: "7+ Years",
    fee: 550,
    availability: "Mon - Sat (08:30 AM - 02:30 PM)",
    img: "images/doctor_024.jpg",
    room: "Skin & Laser Suite - Room 504",
    languages: "English, Marathi, Kannada",
    email: "dr.snehakulkarni@healthcare.demo",
    bio: "Specialist managing pediatric skin rashes, vascular birthmarks, viral warts, urticaria, and contact dermatitis patch testing."
  },
  {
    id: "doc-025",
    name: "Dr. Arthur Wright",
    specialty: "Dermatology",
    qualification: "MBBS, DVD, Cutaneous Surgery Certified",
    experience: "13+ Years",
    fee: 650,
    availability: "Mon - Thu (10:00 AM - 05:00 PM)",
    img: "images/doctor_025.jpg",
    room: "Skin & Laser Suite - Room 505",
    languages: "English",
    email: "dr.arthurwright@healthcare.demo",
    bio: "Dermatologic surgeon skilled in mole removal, cyst excisions, vitiligo surgical grafting, and non-melanoma skin cancer screenings."
  },

  // --- NEUROLOGY (5 Doctors) ---
  {
    id: "doc-026",
    name: "Dr. Robert Miller",
    specialty: "Neurology",
    qualification: "MBBS, DM (Neurology)",
    experience: "15+ Years",
    fee: 800,
    availability: "Mon - Thu (09:30 AM - 04:30 PM)",
    img: "images/doctor_026.jpg",
    room: "Neuroscience Wing - Room 601",
    languages: "English",
    email: "dr.robertmiller@healthcare.demo",
    bio: "Senior consultant neurologist treating chronic headache syndromes, peripheral neuropathies, myasthenia gravis, and neuro-rehabilitation."
  },
  {
    id: "doc-027",
    name: "Dr. Swati Venkat",
    specialty: "Neurology",
    qualification: "MBBS, MD, DM (Neurology), Stroke Fellowship",
    experience: "13+ Years",
    fee: 850,
    availability: "Mon - Fri (09:00 AM - 03:30 PM)",
    img: "images/doctor_027.jpg",
    room: "Neuroscience Wing - Room 602",
    languages: "English, Tamil, Telugu",
    email: "dr.swativenkat@healthcare.demo",
    bio: "Stroke and vascular neurology consultant focused on post-stroke recovery, transient ischemic attack (TIA) workups, and carotid screening."
  },
  {
    id: "doc-028",
    name: "Dr. Nathan Brooks",
    specialty: "Neurology",
    qualification: "MD, Neurophysiology & Epilepsy Care",
    experience: "11+ Years",
    fee: 750,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_028.jpg",
    room: "Neuroscience Wing - Room 603",
    languages: "English",
    email: "dr.nathanbrooks@healthcare.demo",
    bio: "Clinical neurophysiologist specialized in video-EEG interpretation, seizure disorders, refractory epilepsy management, and sleep studies."
  },
  {
    id: "doc-029",
    name: "Dr. Aravind Ramaswamy",
    specialty: "Neurology",
    qualification: "MBBS, DM (Neurology), Movement Disorders",
    experience: "16+ Years",
    fee: 800,
    availability: "Mon - Fri (10:30 AM - 05:30 PM)",
    img: "images/doctor_029.jpg",
    room: "Neuroscience Wing - Room 604",
    languages: "English, Tamil, Kannada",
    email: "dr.aravindramaswamy@healthcare.demo",
    bio: "Movement disorder specialist diagnosing Parkinson's disease, essential tremors, dystonias, and deep brain stimulation (DBS) follow-up."
  },
  {
    id: "doc-030",
    name: "Dr. Hannah Scott",
    specialty: "Neurology",
    qualification: "MD, MRCP (Neurology), Headache Specialist",
    experience: "9+ Years",
    fee: 700,
    availability: "Wed - Sun (09:00 AM - 03:00 PM)",
    img: "images/doctor_030.jpg",
    room: "Neuroscience Wing - Room 605",
    languages: "English",
    email: "dr.hannahscott@healthcare.demo",
    bio: "Headache specialist managing intractable migraines, cluster headaches, cranial neuralgias, and botulinum toxin therapy for migraine."
  },

  // --- OBSTETRICS & GYNECOLOGY (5 Doctors) ---
  {
    id: "doc-031",
    name: "Dr. Olivia Davis",
    specialty: "Obstetrics & Gynecology",
    qualification: "MBBS, MS (OBG), DGO",
    experience: "11+ Years",
    fee: 700,
    availability: "Mon - Fri (10:00 AM - 05:00 PM)",
    img: "images/doctor_031.jpg",
    room: "Women's Health Pavilion - Room 701",
    languages: "English",
    email: "dr.oliviadavis@healthcare.demo",
    bio: "Obstetrician & gynecologist providing comprehensive prenatal care, maternal health guidance, hormonal imbalance care, and wellness screening."
  },
  {
    id: "doc-032",
    name: "Dr. Kavita Deshmukh",
    specialty: "Obstetrics & Gynecology",
    qualification: "MBBS, MD (OBG), High-Risk Pregnancy Specialist",
    experience: "14+ Years",
    fee: 750,
    availability: "Mon - Sat (09:00 AM - 03:30 PM)",
    img: "images/doctor_032.jpg",
    room: "Women's Health Pavilion - Room 702",
    languages: "English, Marathi, Hindi",
    email: "dr.kavitadeshmukh@healthcare.demo",
    bio: "High-risk pregnancy consultant managing gestational diabetes, pre-eclampsia, multiple gestations, and complex obstetric history."
  },
  {
    id: "doc-033",
    name: "Dr. Fiona Gallagher",
    specialty: "Obstetrics & Gynecology",
    qualification: "MRCOG, Laparoscopic Gynecological Surgeon",
    experience: "10+ Years",
    fee: 700,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_033.jpg",
    room: "Women's Health Pavilion - Room 703",
    languages: "English, Irish",
    email: "dr.fionagallagher@healthcare.demo",
    bio: "Minimally invasive surgeon addressing uterine fibroids, ovarian cysts, endometriosis protocols, and hysteroscopic interventions."
  },
  {
    id: "doc-034",
    name: "Dr. Deepa Sundar",
    specialty: "Obstetrics & Gynecology",
    qualification: "MBBS, DNB (OBG), Reproductive Endocrinology",
    experience: "12+ Years",
    fee: 750,
    availability: "Mon - Fri (09:30 AM - 04:30 PM)",
    img: "images/doctor_034.jpg",
    room: "Women's Health Pavilion - Room 704",
    languages: "English, Tamil, Hindi",
    email: "dr.deepasundar@healthcare.demo",
    bio: "Reproductive specialist guiding couples through PCOS management, fertility evaluations, ovulation induction, and recurrent loss investigations."
  },
  {
    id: "doc-035",
    name: "Dr. Grace Morales",
    specialty: "Obstetrics & Gynecology",
    qualification: "MD (OBG), Adolescent Gynecology & Menopause Care",
    experience: "8+ Years",
    fee: 600,
    availability: "Wed - Sun (11:00 AM - 06:00 PM)",
    img: "images/doctor_035.jpg",
    room: "Women's Health Pavilion - Room 705",
    languages: "English, Spanish",
    email: "dr.gracemorales@healthcare.demo",
    bio: "Compassionate gynecologist counseling on menstrual irregularities in teens, contraceptive planning, cervical cancer screening, and menopause care."
  },

  // --- ENT SPECIALIST (5 Doctors) ---
  {
    id: "doc-036",
    name: "Dr. Sophia Taylor",
    specialty: "ENT Specialist",
    qualification: "MBBS, MS (ENT)",
    experience: "7+ Years",
    fee: 500,
    availability: "Mon - Sat (09:00 AM - 02:00 PM)",
    img: "images/doctor_036.jpg",
    room: "ENT & Audiology Wing - Room 801",
    languages: "English",
    email: "dr.sophiataylor@healthcare.demo",
    bio: "Otolaryngologist providing clinical care for sinusitis, hearing disorders, chronic tonsillitis, ear infections, and vertigo assessment."
  },
  {
    id: "doc-037",
    name: "Dr. Manoj Chawla",
    specialty: "ENT Specialist",
    qualification: "MBBS, DLO, Rhinology & Endoscopic Sinus Surgery",
    experience: "12+ Years",
    fee: 600,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor_037.jpg",
    room: "ENT & Audiology Wing - Room 802",
    languages: "English, Hindi, Punjabi",
    email: "dr.manojchawla@healthcare.demo",
    bio: "Rhinology expert managing nasal polyps, deviated nasal septum (DNS), chronic rhinosinusitis, and skull base endoscopic procedures."
  },
  {
    id: "doc-038",
    name: "Dr. Liam Gallagher",
    specialty: "ENT Specialist",
    qualification: "MD, Otology & Cochlear Implants Fellowship",
    experience: "10+ Years",
    fee: 650,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_038.jpg",
    room: "ENT & Audiology Wing - Room 803",
    languages: "English",
    email: "dr.liamgallagher@healthcare.demo",
    bio: "Ear specialist managing conductive and sensorineural hearing loss, tympanic membrane perforations, mastoid disease, and tinnitus therapies."
  },
  {
    id: "doc-039",
    name: "Dr. Gayathri Mohan",
    specialty: "ENT Specialist",
    qualification: "MBBS, MS (ENT), Laryngology & Voice Disorders",
    experience: "9+ Years",
    fee: 550,
    availability: "Mon - Sat (08:30 AM - 03:00 PM)",
    img: "images/doctor_039.jpg",
    room: "ENT & Audiology Wing - Room 804",
    languages: "English, Tamil, Hindi",
    email: "dr.gayathrimohan@healthcare.demo",
    bio: "Voice and swallowing specialist evaluating vocal cord nodules, professional voice strain, hoarseness, and dysphagia."
  },
  {
    id: "doc-040",
    name: "Dr. Carlos Mendez",
    specialty: "ENT Specialist",
    qualification: "MBBS, DNB (ENT), Sleep Apnea & Snoring Care",
    experience: "11+ Years",
    fee: 600,
    availability: "Wed - Sun (10:00 AM - 04:30 PM)",
    img: "images/doctor_040.jpg",
    room: "ENT & Audiology Wing - Room 805",
    languages: "English, Spanish",
    email: "dr.carlosmendez@healthcare.demo",
    bio: "Sleep surgery specialist conducting sleep endoscopy, obstructive sleep apnea evaluation, snoring corrections, and adenoid hypertrophy care."
  },

  // --- OPHTHALMOLOGY (5 Doctors) ---
  {
    id: "doc-041",
    name: "Dr. Ava Martinez",
    specialty: "Ophthalmology",
    qualification: "MBBS, MS (Ophthalmology)",
    experience: "13+ Years",
    fee: 600,
    availability: "Mon - Fri (09:00 AM - 04:00 PM)",
    img: "images/doctor_041.jpg",
    room: "Eye Center - Room 901",
    languages: "English, Spanish",
    email: "dr.avamartinez@healthcare.demo",
    bio: "Comprehensive eye care consultant focusing on cataract micro-surgery assessment, refractive errors, dry eye disease, and ocular allergy."
  },
  {
    id: "doc-042",
    name: "Dr. Karthik Subramanian",
    specialty: "Ophthalmology",
    qualification: "MBBS, MS, Fellowship Vitreo-Retina",
    experience: "15+ Years",
    fee: 700,
    availability: "Mon - Sat (08:30 AM - 03:30 PM)",
    img: "images/doctor_042.jpg",
    room: "Eye Center - Room 902",
    languages: "English, Tamil, Hindi",
    email: "dr.karthiksubramanian@healthcare.demo",
    bio: "Retinal specialist treating diabetic retinopathy, retinal vascular occlusions, macular degeneration, and retinal laser interventions."
  },
  {
    id: "doc-043",
    name: "Dr. Emma Watson-Reid",
    specialty: "Ophthalmology",
    qualification: "MD, Cornea & Refractive Laser Surgery",
    experience: "10+ Years",
    fee: 650,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_043.jpg",
    room: "Eye Center - Room 903",
    languages: "English",
    email: "dr.emmawatson@healthcare.demo",
    bio: "Corneal specialist diagnosing keratoconus, corneal dystrophies, ocular surface infections, and refractive laser eligibility screening."
  },
  {
    id: "doc-044",
    name: "Dr. Vandana Hegde",
    specialty: "Ophthalmology",
    qualification: "MBBS, DO, Glaucoma Consultant",
    experience: "12+ Years",
    fee: 600,
    availability: "Mon - Fri (09:30 AM - 04:30 PM)",
    img: "images/doctor_044.jpg",
    room: "Eye Center - Room 904",
    languages: "English, Kannada, Hindi",
    email: "dr.vandanahegde@healthcare.demo",
    bio: "Glaucoma specialist focused on early visual field testing, optical coherence tomography (OCT), intraocular pressure control, and laser trabeculoplasty."
  },
  {
    id: "doc-045",
    name: "Dr. Brian O'Connor",
    specialty: "Ophthalmology",
    qualification: "MBBS, MS, Pediatric Ophthalmology & Strabismus",
    experience: "9+ Years",
    fee: 550,
    availability: "Wed - Sun (11:00 AM - 05:30 PM)",
    img: "images/doctor_045.jpg",
    room: "Eye Center - Room 905",
    languages: "English",
    email: "dr.brianoconnor@healthcare.demo",
    bio: "Pediatric ophthalmologist managing amblyopia (lazy eye), pediatric refraction, squint evaluation, and congenital lacrimal duct obstruction."
  },

  // --- DENTAL SURGERY (5 Doctors) ---
  {
    id: "doc-046",
    name: "Dr. Isabella Thomas",
    specialty: "Dental Surgery",
    qualification: "BDS, MDS (Oral & Maxillofacial Surgery)",
    experience: "6+ Years",
    fee: 450,
    availability: "Tue - Sun (10:00 AM - 07:00 PM)",
    img: "images/doctor_046.jpg",
    room: "Dental Clinic Suite - Room 1001",
    languages: "English",
    email: "dr.isabellathomas@healthcare.demo",
    bio: "Dental surgeon offering root canal treatments, impacted wisdom tooth extractions, minor maxillofacial trauma, and aesthetic smile designs."
  },
  {
    id: "doc-047",
    name: "Dr. Nitesh Bansal",
    specialty: "Dental Surgery",
    qualification: "BDS, MDS (Orthodontics & Dentofacial Orthopedics)",
    experience: "11+ Years",
    fee: 550,
    availability: "Mon - Fri (09:00 AM - 05:00 PM)",
    img: "images/doctor_047.jpg",
    room: "Dental Clinic Suite - Room 1002",
    languages: "English, Hindi",
    email: "dr.niteshbansal@healthcare.demo",
    bio: "Orthodontist specializing in clear aligner therapy, metal and ceramic self-ligating braces, malocclusion corrections, and retainers."
  },
  {
    id: "doc-048",
    name: "Dr. Charlotte King",
    specialty: "Dental Surgery",
    qualification: "DDS, Conservative Dentistry & Endodontics",
    experience: "8+ Years",
    fee: 500,
    availability: "Mon - Sat (09:30 AM - 04:30 PM)",
    img: "images/doctor_048.jpg",
    room: "Dental Clinic Suite - Room 1003",
    languages: "English",
    email: "dr.charlotteking@healthcare.demo",
    bio: "Endodontic specialist performing single-visit microscopic root canals, composite restorations, tooth re-treatments, and dental emergencies."
  },
  {
    id: "doc-049",
    name: "Dr. Preeti Raghavan",
    specialty: "Dental Surgery",
    qualification: "BDS, MDS (Periodontics & Implantology)",
    experience: "10+ Years",
    fee: 500,
    availability: "Tue - Sat (10:00 AM - 06:00 PM)",
    img: "images/doctor_049.jpg",
    room: "Dental Clinic Suite - Room 1004",
    languages: "English, Tamil, Hindi",
    email: "dr.preetiraghavan@healthcare.demo",
    bio: "Periodontist and dental implantologist handling gum surgeries, laser gingivectomy, bone grafting, and routine scaling & polishing."
  },
  {
    id: "doc-050",
    name: "Dr. Simon Bennett",
    specialty: "Dental Surgery",
    qualification: "BDS, Pediatric Dentistry Fellow",
    experience: "7+ Years",
    fee: 450,
    availability: "Mon - Fri (08:30 AM - 03:30 PM)",
    img: "images/doctor_050.jpg",
    room: "Dental Clinic Suite - Room 1005",
    languages: "English",
    email: "dr.simonbennett@healthcare.demo",
    bio: "Child dental specialist emphasizing preventative dental sealants, painless cavity restorations, habit-breaking appliances, and fluoride therapy."
  },

  // --- PSYCHIATRY (5 Doctors) ---
  {
    id: "doc-051",
    name: "Dr. Mia White",
    specialty: "Psychiatry",
    qualification: "MBBS, MD (Psychiatry)",
    experience: "10+ Years",
    fee: 750,
    availability: "Mon - Fri (02:00 PM - 07:00 PM)",
    img: "images/doctor_051.jpg",
    room: "Behavioral Health Wing - Room 1101",
    languages: "English",
    email: "dr.miawhite@healthcare.demo",
    bio: "Consultant psychiatrist dedicated to adult behavioral health, work stress relief, generalized anxiety management, and depressive disorders."
  },
  {
    id: "doc-052",
    name: "Dr. Anand Vardhan",
    specialty: "Psychiatry",
    qualification: "MBBS, DPM, MD (Psychiatry)",
    experience: "16+ Years",
    fee: 800,
    availability: "Mon - Sat (09:00 AM - 03:00 PM)",
    img: "images/doctor_052.jpg",
    room: "Behavioral Health Wing - Room 1102",
    languages: "English, Hindi",
    email: "dr.anandvardhan@healthcare.demo",
    bio: "Senior psychiatrist providing pharmacotherapy and holistic care for bipolar mood disorders, obsessive-compulsive disorder, and insomnia."
  },
  {
    id: "doc-053",
    name: "Dr. Rachel Greenburg",
    specialty: "Psychiatry",
    qualification: "MD (Psychiatry), Cognitive Behavioral Specialist",
    experience: "12+ Years",
    fee: 750,
    availability: "Tue - Sat (10:00 AM - 05:00 PM)",
    img: "images/doctor_053.jpg",
    room: "Behavioral Health Wing - Room 1103",
    languages: "English",
    email: "dr.rachelgreenburg@healthcare.demo",
    bio: "Psychiatrist combining medical therapy with cognitive behavioral counseling for panic disorder, phobias, and trauma-related stress."
  },
  {
    id: "doc-054",
    name: "Dr. Sunita Sen",
    specialty: "Psychiatry",
    qualification: "MBBS, DNB (Psychiatry), Geriatric Neuropsychiatry",
    experience: "14+ Years",
    fee: 800,
    availability: "Mon - Fri (09:30 AM - 04:30 PM)",
    img: "images/doctor_054.jpg",
    room: "Behavioral Health Wing - Room 1104",
    languages: "English, Bengali, Hindi",
    email: "dr.sunitasim@healthcare.demo",
    bio: "Geriatric psychiatrist focusing on cognitive decline, dementia-related mood changes, late-life depression, and caregiver counseling."
  },
  {
    id: "doc-055",
    name: "Dr. Ethan Ross",
    specialty: "Psychiatry",
    qualification: "MD, Child & Adolescent Behavioral Health",
    experience: "9+ Years",
    fee: 700,
    availability: "Wed - Sun (11:00 AM - 06:00 PM)",
    img: "images/doctor_055.jpg",
    room: "Behavioral Health Wing - Room 1105",
    languages: "English",
    email: "dr.ethanross@healthcare.demo",
    bio: "Adolescent mental health consultant addressing academic anxiety, attention deficit hyperactivity disorder (ADHD), and emotional resilience."
  }
];

// ============================================================================
// 2. STANDARD TIME SLOTS
// ============================================================================
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

// ============================================================================
// 3. STORAGE KEYS & DEMO ACCOUNTS (NO PASSWORDS STORED)
// ============================================================================
const STORAGE_KEY_APPOINTMENTS = "healthcare_appointments_demo";
const STORAGE_KEY_SESSION = "healthcare_active_session_demo";

// Fictional Prototype Accounts for Demonstration
const DEMO_PREVIEW_ACCOUNTS = {
  patient: {
    role: "Patient",
    patientId: "pat-101",
    name: "Ananya Raman",
    email: "ananya.raman@healthcare.demo",
    phone: "+91 98401 99999",
    age: 32,
    gender: "Female"
  },
  physician: {
    role: "Physician",
    doctorId: "doc-001",
    name: "Dr. John Smith",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    email: "dr.johnsmith@healthcare.demo",
    phone: "+91 98400 11001",
    room: "Cardiology Wing - Room 101"
  },
  physicianSecondary: {
    role: "Physician",
    doctorId: "doc-021",
    name: "Dr. Emily Clark",
    specialty: "Dermatology",
    qualification: "MBBS, MD (DVL)",
    email: "dr.emilyclark@healthcare.demo",
    phone: "+91 98400 11021",
    room: "Skin & Laser Suite - Room 501"
  }
};

// ============================================================================
// 4. STORAGE ACCESS & INITIAL DATA SEEDING
// ============================================================================
function getAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) {
      // Seed with realistic fictional outpatient appointments
      const initialBookings = [
        {
          id: "HC-2026-1042",
          patientId: "pat-101",
          patientName: "Ananya Raman",
          email: "ananya.raman@healthcare.demo",
          phone: "+91 98401 99999",
          patientAge: 32,
          patientGender: "Female",
          doctorId: "doc-001",
          doctorName: "Dr. John Smith",
          specialty: "Cardiology",
          appointmentDate: getTodayDateString(),
          timeSlot: "10:00 AM",
          status: "Scheduled",
          fee: 700,
          room: "Cardiology Wing - Room 101",
          notes: "Routine quarterly cardiovascular review and BP check.",
          createdAt: new Date().toISOString()
        },
        {
          id: "HC-2026-1043",
          patientId: "pat-102",
          patientName: "Karthik Verma",
          email: "karthik.demo@healthcare.local",
          phone: "+91 98403 88888",
          patientAge: 48,
          patientGender: "Male",
          doctorId: "doc-001",
          doctorName: "Dr. John Smith",
          specialty: "Cardiology",
          appointmentDate: getOffsetDateString(1),
          timeSlot: "11:15 AM",
          status: "Scheduled",
          fee: 700,
          room: "Cardiology Wing - Room 101",
          notes: "Hypertension assessment and medication review.",
          createdAt: new Date().toISOString()
        },
        {
          id: "HC-2026-1044",
          patientId: "pat-103",
          patientName: "Suresh Menon",
          email: "suresh.demo@healthcare.local",
          phone: "+91 98404 77777",
          patientAge: 56,
          patientGender: "Male",
          doctorId: "doc-001",
          doctorName: "Dr. John Smith",
          specialty: "Cardiology",
          appointmentDate: getOffsetDateString(-2),
          timeSlot: "09:00 AM",
          status: "Completed",
          fee: 700,
          room: "Cardiology Wing - Room 101",
          notes: "Lipid profile consultation. Completed normally.",
          createdAt: new Date().toISOString()
        },
        {
          id: "HC-2026-1045",
          patientId: "pat-101",
          patientName: "Ananya Raman",
          email: "ananya.raman@healthcare.demo",
          phone: "+91 98401 99999",
          patientAge: 32,
          patientGender: "Female",
          doctorId: "doc-021",
          doctorName: "Dr. Emily Clark",
          specialty: "Dermatology",
          appointmentDate: getOffsetDateString(2),
          timeSlot: "02:30 PM",
          status: "Scheduled",
          fee: 600,
          room: "Skin & Laser Suite - Room 501",
          notes: "Follow up consultation for seasonal skin allergy.",
          createdAt: new Date().toISOString()
        },
        {
          id: "HC-2026-1046",
          patientId: "pat-104",
          patientName: "Vikram Das",
          email: "vikram.demo@healthcare.local",
          phone: "+91 98405 66666",
          patientAge: 41,
          patientGender: "Male",
          doctorId: "doc-011",
          doctorName: "Dr. Michael Brown",
          specialty: "Orthopedics",
          appointmentDate: getOffsetDateString(-1),
          timeSlot: "10:00 AM",
          status: "Cancelled",
          fee: 650,
          room: "Orthopedic Pavilion - Room 301",
          notes: "Patient cancelled due to unexpected travel.",
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

// ============================================================================
// 5. ROLE & SESSION MANAGEMENT (NO PASSWORDS IN STORAGE)
// ============================================================================
function getActiveSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SESSION) || localStorage.getItem(STORAGE_KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setActiveSession(userObj, rememberInLocalStorage = false) {
  try {
    const serialized = JSON.stringify(userObj);
    sessionStorage.setItem(STORAGE_KEY_SESSION, serialized);
    if (rememberInLocalStorage) {
      localStorage.setItem(STORAGE_KEY_SESSION, serialized);
    }
  } catch (e) {
    console.error("Error saving session:", e);
  }
}

function clearActiveSession() {
  sessionStorage.removeItem(STORAGE_KEY_SESSION);
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

/**
 * Role & Session Guard
 * Enforces role access on protected pages during the demonstration.
 * @param {string} requiredRole - "Patient" or "Physician"
 * @param {string} redirectUrl - where to redirect if unauthorized (default login.html)
 */
function enforceRoleGuard(requiredRole, redirectUrl = "login.html") {
  const session = getActiveSession();

  if (!session || !session.role) {
    // Unauthenticated: redirect to login
    window.location.replace(`${redirectUrl}?notice=auth_required&role=${encodeURIComponent(requiredRole)}`);
    return null;
  }

  if (session.role.toLowerCase() !== requiredRole.toLowerCase()) {
    // Role mismatch: redirect to their own portal
    if (session.role.toLowerCase() === "patient") {
      window.location.replace("patient-dashboard.html?notice=role_redirect");
    } else if (session.role.toLowerCase() === "physician") {
      window.location.replace("physician-dashboard.html?notice=role_redirect");
    } else {
      window.location.replace("login.html");
    }
    return null;
  }

  return session;
}

/**
 * Global Portal Navbar Sync
 * Configures role-specific navigation links. Neither role sees the other's options.
 */
function syncPortalNavbar() {
  const session = getActiveSession();
  const navSlot = document.getElementById("navbarUserSlot");
  if (!navSlot) return;

  if (session && session.role === "Patient") {
    navSlot.innerHTML = `
      <div class="dropdown d-inline-block">
        <button class="btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-check-fill text-teal"></i>
          <span class="fw-semibold">${escapeHtml(session.name || 'Patient')}</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Patient</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><h6 class="dropdown-header">Patient Portal</h6></li>
          <li><a class="dropdown-item" href="patient-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>My Dashboard</a></li>
          <li><a class="dropdown-item" href="doctors.html"><i class="bi bi-person-lines-fill me-2"></i>Browse Doctors</a></li>
          <li><a class="dropdown-item" href="javascript:void(0)" onclick="openMyAppointmentsModal()"><i class="bi bi-journal-bookmark me-2"></i>My Bookings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
        </ul>
      </div>
    `;
  } else if (session && session.role === "Physician") {
    navSlot.innerHTML = `
      <div class="dropdown d-inline-block">
        <button class="btn btn-sm btn-outline-teal dropdown-toggle d-flex align-items-center gap-2" style="border: 1.5px solid var(--teal-accent); color: var(--teal-dark);" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-heart-pulse-fill text-teal"></i>
          <span class="fw-semibold">${escapeHtml(session.name || 'Physician')}</span>
          <span class="badge bg-teal-light text-teal border border-teal-subtle">Physician</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><h6 class="dropdown-header">Consulting Physician</h6></li>
          <li><a class="dropdown-item" href="physician-dashboard.html"><i class="bi bi-hospital me-2"></i>Physician Dashboard</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
        </ul>
      </div>
    `;
  } else {
    navSlot.innerHTML = `
      <a href="login.html" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
        <i class="bi bi-person-lock"></i>
        <span>Portal Login</span>
      </a>
    `;
  }
}

function handleLogout() {
  clearActiveSession();
  window.location.href = "login.html?notice=logged_out";
}

// ============================================================================
// 6. BACKEND-READY SERVICE MODULES (Placeholder REST API Interfaces)
// ============================================================================

/**
 * Authentication Service Interface
 * Documentation: Connects to backend endpoints:
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/logout
 */
const authService = {
  async login(email, password, role) {
    // PLACEHOLDER: Real backend would execute:
    // const res = await fetch('/api/v1/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, role })
    // });
    // return await res.json();
    return Promise.resolve({
      connected: false,
      message: "Static GitHub Pages frontend: Real authentication requires backend API."
    });
  },

  loginDemo(roleKey, customDoctorId = null) {
    if (roleKey === "patient") {
      const p = DEMO_PREVIEW_ACCOUNTS.patient;
      setActiveSession(p);
      return p;
    } else if (roleKey === "physician") {
      let doc = DEMO_PREVIEW_ACCOUNTS.physician;
      if (customDoctorId) {
        const found = findDoctorById(customDoctorId);
        if (found) {
          doc = {
            role: "Physician",
            doctorId: found.id,
            name: found.name,
            specialty: found.specialty,
            qualification: found.qualification,
            email: found.email || `${found.id}@healthcare.demo`,
            phone: "+91 98400 00000",
            room: found.room || "Main OPD Complex"
          };
        }
      }
      setActiveSession(doc);
      return doc;
    }
    return null;
  }
};

/**
 * Patient Service Interface
 * Documentation: Connects to backend endpoints:
 *   GET /api/v1/patient/appointments
 *   POST /api/v1/appointments
 *   PATCH /api/v1/appointments/:id/cancel
 */
const patientService = {
  getAppointments(patientId = null) {
    const list = getAppointments();
    if (!patientId) {
      const sess = getActiveSession();
      patientId = sess && sess.role === "Patient" ? (sess.patientId || "pat-101") : null;
    }
    if (!patientId) return list;
    return list.filter(item => !item.patientId || item.patientId === patientId);
  },

  createBooking(bookingData) {
    // Check collision
    if (isSlotBooked(bookingData.doctorId, bookingData.appointmentDate, bookingData.timeSlot)) {
      throw new Error(`Slot ${bookingData.timeSlot} on ${bookingData.appointmentDate} is already occupied.`);
    }

    const bookingId = generateBookingId();
    const newBooking = {
      id: bookingId,
      ...bookingData,
      status: "Scheduled",
      createdAt: new Date().toISOString()
    };

    const all = getAppointments();
    all.push(newBooking);
    saveAppointments(all);
    return newBooking;
  },

  cancelBooking(bookingId) {
    const all = getAppointments();
    let updated = false;
    const nextList = all.map(b => {
      if (b.id === bookingId) {
        updated = true;
        return { ...b, status: "Cancelled" };
      }
      return b;
    });

    if (updated) {
      saveAppointments(nextList);
      return true;
    }
    return false;
  }
};

/**
 * Consulting Physician Service Interface
 * Documentation: Connects to backend endpoints:
 *   GET /api/v1/physician/appointments?doctorId=:id
 *   PATCH /api/v1/appointments/:id/status
 */
const physicianService = {
  getAssignedAppointments(doctorId) {
    if (!doctorId) return [];
    const list = getAppointments();
    // Strictly isolate by doctorId
    return list.filter(item => item.doctorId === doctorId || item.doctorName === doctorId);
  },

  updateStatus(bookingId, doctorId, newStatus) {
    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const list = getAppointments();
    let found = false;
    const updated = list.map(item => {
      if (item.id === bookingId && (item.doctorId === doctorId || !doctorId)) {
        found = true;
        return { ...item, status: newStatus };
      }
      return item;
    });

    if (found) {
      saveAppointments(updated);
      return true;
    }
    return false;
  }
};

// ============================================================================
// 7. HELPER UTILITIES & LOOKUPS
// ============================================================================
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

// Slot collision check
function isSlotBooked(doctorNameOrId, date, slot, excludeBookingId = null) {
  const list = getAppointments();
  return list.some(item => {
    const isDocMatch = (item.doctorId && item.doctorId === doctorNameOrId) ||
                       (item.doctorName && item.doctorName.toLowerCase() === doctorNameOrId.toLowerCase());
    return isDocMatch &&
      item.appointmentDate === date &&
      item.timeSlot === slot &&
      item.status !== "Cancelled" &&
      item.id !== excludeBookingId;
  });
}

function findDoctorById(id) {
  if (!id) return null;
  return DOCTORS_DATA.find(d => d.id === id.trim()) || null;
}

function findDoctorByName(name) {
  if (!name) return null;
  return DOCTORS_DATA.find(d => d.name.trim().toLowerCase() === name.trim().toLowerCase()) || null;
}

function findDoctorByIdOrName(query) {
  if (!query) return null;
  const byId = findDoctorById(query);
  if (byId) return byId;
  return findDoctorByName(query);
}

function getAllDepartments() {
  const depts = new Set();
  DOCTORS_DATA.forEach(d => depts.add(d.specialty));
  return Array.from(depts);
}

function getDepartmentCount(deptName) {
  if (!deptName || deptName.toLowerCase() === 'all') return DOCTORS_DATA.length;
  return DOCTORS_DATA.filter(d => d.specialty.toLowerCase() === deptName.toLowerCase()).length;
}

function handleImageError(imgEl) {
  imgEl.onerror = null;
  imgEl.src = "images/doctor_avatar_fallback.svg";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// 8. "MY BOOKINGS" MODAL SYSTEM
// ============================================================================
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
            <h5 class="modal-title fw-bold text-white"><i class="bi bi-calendar-check me-2"></i>My Booked Appointments</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" id="modalAppointmentsBody">
            <!-- Dynamically populated -->
          </div>
          <div class="modal-footer bg-light">
            <span class="text-muted small me-auto"><i class="bi bi-info-circle me-1"></i>Saved locally in browser storage for demonstration.</span>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <a href="doctors.html" class="btn btn-primary"><i class="bi bi-person-lines-fill me-1"></i>Browse Doctors</a>
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

  const session = getActiveSession();
  const patientId = session && session.role === "Patient" ? session.patientId : null;
  const bookings = patientService.getAppointments(patientId);

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 fw-bold text-secondary">No Consultations Found</h5>
        <p class="text-muted small">You haven't scheduled any doctor consultations on this device yet.</p>
        <a href="doctors.html" class="btn btn-primary mt-2">Find a Specialist</a>
      </div>
    `;
    return;
  }

  const sorted = [...bookings].reverse();
  let html = `
    <div class="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-shield-check fs-5"></i>
      <div><strong>Demonstration Storage:</strong> These bookings are stored in browser localStorage. Real production portals synchronize with a secure clinical database.</div>
    </div>
  `;

  sorted.forEach(item => {
    const isCancelled = item.status === "Cancelled";
    const isCompleted = item.status === "Completed";
    const badgeClass = isCompleted ? 'bg-secondary' : (isCancelled ? 'bg-danger' : 'bg-success');

    html += `
      <div class="appointment-list-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 mb-3 ${isCancelled ? 'opacity-75 bg-light' : 'bg-white'}">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${badgeClass}">${escapeHtml(item.status)}</span>
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
          ${(!isCancelled && !isCompleted) ? `
            <button class="btn btn-outline-danger btn-sm" onclick="handleModalCancelAppointment('${escapeHtml(item.id)}')">
              <i class="bi bi-x-circle me-1"></i>Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function handleModalCancelAppointment(bookingId) {
  if (!confirm(`Are you sure you want to cancel appointment ${bookingId}?`)) return;
  patientService.cancelBooking(bookingId);
  renderModalAppointments();
}

// ============================================================================
// 9. AUTOMATIC INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", function() {
  getAppointments(); // ensures initial seed
  syncPortalNavbar();
});