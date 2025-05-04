export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const contentType = res.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');
    const raw = await res.text();
    if (!res.ok) {
      const message = isJson ? JSON.parse(raw)?.detail : raw.slice(0, 100);
      throw new Error(`Login failed: ${message}`);
    }
    const data = isJson ? JSON.parse(raw) : {};
    localStorage.setItem('token', data.access_token);
    window.location.href = '/main';
    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw new Error(err.message || 'Unexpected login error');
  }
};