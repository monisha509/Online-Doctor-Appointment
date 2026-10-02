const http = require('http');

const urls = [
  'http://localhost:3000/index.html',
  'http://localhost:3000/home.html',
  'http://localhost:3000/doctors.html',
  'http://localhost:3000/appointment.html',
  'http://localhost:3000/login.html',
  'http://localhost:3000/patient-dashboard.html',
  'http://localhost:3000/physician-dashboard.html',
  'http://localhost:3000/success.html',
  'http://localhost:3000/css/style.css',
  'http://localhost:3000/js/script.js',
  'http://localhost:3000/images/doctor_avatar_fallback.svg',
  'http://localhost:3000/images/doctor_001.jpg',
  'http://localhost:3000/images/doctor_025.jpg',
  'http://localhost:3000/images/doctor_055.jpg',
  'http://localhost:3000/images/indexbg.jpg',
  'http://localhost:3000/images/loginbg.jpg',
  'http://localhost:3000/images/appointmentbg.jpg',
  'http://localhost:3000/images/successbg.jpg'
];

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(data);
        resolve({ url, status: res.statusCode, length: body.length });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Running server endpoint verification...");
  let failed = 0;
  for (const u of urls) {
    try {
      const res = await checkUrl(u);
      if (res.status === 200) {
        console.log(`[PASS] ${res.status} OK - ${res.url} (${res.length} bytes)`);
      } else {
        console.error(`[FAIL] ${res.status} - ${res.url}`);
        failed++;
      }
    } catch (e) {
      console.error(`[ERROR] ${u}: ${e.message}`);
      failed++;
    }
  }
  if (failed === 0) {
    console.log("All endpoints returned 200 OK!");
  } else {
    process.exit(1);
  }
}

run();
