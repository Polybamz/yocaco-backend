const fetch = require('node-fetch');

(async () => {
  const ts = Date.now();
  try {
    const res = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${ts}@example.com`,
        password: 'test123',
        userType: 'jobseeker',
        profileComplete: false
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
})();