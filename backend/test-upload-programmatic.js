const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
const email = 'test-upload@example.com';
const senha = 'Test12345';
const nome = 'Test Upload';
const filePath = path.resolve(__dirname, '../frontend-react/public/assets/avatars/avatar1.svg');

async function run() {
  try {
    console.log('Using file:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(2);
    }

    // Try to register (ignore if already exists)
    try {
      const reg = await axios.post(`${backendUrl}/api/auth/register`, { nome, email, senha });
      console.log('Register response:', reg.status, reg.data);
    } catch (e) {
      if (e.response) {
        console.log('Register failed (status):', e.response.status, e.response.data);
      } else console.log('Register error:', e.message);
    }

    // Login
    const loginResp = await axios.post(`${backendUrl}/api/auth/login`, { email, senha });
    const token = loginResp.data?.token;
    if (!token) {
      console.error('No token returned from login');
      process.exit(3);
    }
    console.log('Obtained token (first 40 chars):', token.slice(0, 40));

    // Upload file
    const form = new FormData();
    form.append('profilePicture', fs.createReadStream(filePath));

    const headers = Object.assign({}, form.getHeaders(), { Authorization: `Bearer ${token}` });

    const uploadResp = await axios.post(`${backendUrl}/api/profile/upload-picture`, form, { headers });
    console.log('Upload response status:', uploadResp.status);
    console.log('Upload response data:', uploadResp.data);

    // Fetch /api/auth/me
    const meResp = await axios.get(`${backendUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('/api/auth/me:', meResp.data);

    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(4);
  }
}

run();
