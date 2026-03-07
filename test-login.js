const http = require('http');

const data = JSON.stringify({
  email: 'admin@datsachtamnong.com',
  password: 'admin123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(body);
      console.log('✅ Login Success!');
      console.log('Response:', JSON.stringify(response, null, 2));
    } else {
      console.log('❌ Login Failed');
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
    }
    process.exit();
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
