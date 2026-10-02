// Test fetching Unsplash royalty-free medical portraits
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Test URL
const url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80';
const dest = path.join(ROOT_DIR, 'images', 'test_doc.jpg');

function download(u, target) {
  return new Promise((resolve, reject) => {
    https.get(u, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, target).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const stream = fs.createWriteStream(target);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(target);
      });
    }).on('error', reject);
  });
}

download(url, dest)
  .then(() => {
    const stats = fs.statSync(dest);
    console.log('Downloaded successfully:', stats.size, 'bytes');
  })
  .catch(err => console.error('Download error:', err.message));
