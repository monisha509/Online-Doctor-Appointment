const http = require('http');

const urls = [
  'http://localhost:3000/index.html',
  'http://localhost:3000/home.html',
  'http://localhost:3000/doctors.html',
  'http://localhost:3000/appointment.html',
  'http://localhost:3000/login.html',
  'http://localhost:3000/success.html',
  'http://localhost:3000/css/style.css',
  'http://localhost:3000/js/script.js',
  'http://localhost:3000/images/REC.png',
  'http://localhost:3000/images/doctor1.jpg',
  'http://localhost:3000/images/doctor11.jpg',
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
  console.log("Running endpoint verification...");
  for (const u of urls) {
    try {
      const res = await checkUrl(u);
      if (res.status === 200) {
        console.log(`[PASS] ${res.status} OK - ${res.url} (${res.length} bytes)`);
      } else {
        console.error(`[FAIL] ${res.status} - ${res.url}`);
      }
    } catch (e) {
      console.error(`[ERROR] ${u}: ${e.message}`);
    }
  }
}

run();
