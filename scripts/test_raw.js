const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
console.log("Testing Key:", key ? `${key.substring(0, 5)}...` : "UNDEFINED");

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${key}`,
  method: 'GET',
};

console.log(`Hitting: https://${options.hostname}${options.path.split('?')[0]}...`);

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
      try {
          const json = JSON.parse(body);
          if (json.models) {
              console.log("✅ AVAILABLE MODELS:");
              json.models.forEach(m => console.log(` - ${m.name}`));
          } else {
              console.log("❌ NO MODELS FOUND in response:", body);
          }
      } catch (e) {
          console.log("RAW BODY:", body);
      }
  });
});

req.on('error', error => {
  console.error("REQ ERROR:", error);
});

req.end();
