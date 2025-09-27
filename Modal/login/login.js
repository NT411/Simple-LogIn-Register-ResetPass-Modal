

document.addEventListener('DOMContentLoaded', function () {
  // Lottie Animations
  lottie.loadAnimation({ container: document.getElementById("lottie-animation1"), renderer: "svg", loop: true, autoplay: true, path: "/assets/animation.json" });
  lottie.loadAnimation({ container: document.getElementById("lottie-animation2"), renderer: "svg", loop: true, autoplay: true, path: "/assets/animation.json" });
  lottie.loadAnimation({ container: document.getElementById("lottie-animation3"), renderer: "svg", loop: true, autoplay: true, path: "/assets/animation.json" });

  // 👉 Your backend API base
  const API = "http://localhost:3000";

  // Modals
  const loginModal = document.getElementById('logInModal');
  const resetModal = document.getElementById('resetPasswordModal');
  const registerModal = document.getElementById('registerPasswordModal');

  function showModal(modalToShow) {
    [loginModal, resetModal, registerModal].forEach(m => m.style.display = 'none');
    modalToShow.style.display = 'flex';
  }

  // Switch links
  document.getElementById('switchToResetFromLogin')?.addEventListener('click', e => { e.preventDefault(); showModal(resetModal); });
  document.getElementById('switchToRegisterFromLogin')?.addEventListener('click', e => { e.preventDefault(); showModal(registerModal); });
  document.getElementById('switchToLoginFromReset')?.addEventListener('click', e => { e.preventDefault(); showModal(loginModal); });
  document.getElementById('switchToRegisterFromReset')?.addEventListener('click', e => { e.preventDefault(); showModal(registerModal); });
  document.getElementById('switchToLoginFromRegister')?.addEventListener('click', e => { e.preventDefault(); showModal(loginModal); });
  document.getElementById('switchToResetPasswordFromRegister')?.addEventListener('click', e => { e.preventDefault(); showModal(resetModal); });

  // Small helper for POST
  async function post(url, body) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // keep refresh cookie on login
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data, status: res.status };
    } catch (err) {
      return { ok: false, data: { error: err?.message || 'Network error' }, status: 0 };
    }
  }

  // === FORM HANDLERS ===

  // Login
  document.querySelector('.loginSubmitBtn')?.addEventListener('click', async e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) return alert('Please enter email and password');

    const { ok, data } = await post(`${API}/api/auth/login`, { email, password });
    if (ok && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      alert('Login successful');
      window.location.href = "dashboard.html";
    } else {
      alert(data.error || 'Login failed');
    }
  });

  // Register → prompt for 6-digit code → Verify
  document.querySelector('.registerSubmitBtn')?.addEventListener('click', async e => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('chosePassword').value;
    if (!email || !password) return alert('Please enter email and password');

    // 1) Register
    const reg = await post(`${API}/api/auth/register`, { email, password });
    if (!reg.ok) return alert(reg.data.error || 'Registration failed');

    alert('Registered. Check your email (in dev: server console) for a 6-digit code.');

    // 2) Prompt for code and verify
    const code = prompt('Enter your 6-digit verification code:');
    if (!code) return;

    const ver = await post(`${API}/api/auth/verify`, { token: code.trim() });
    if (ver.ok) {
      alert('Email verified! You can now log in.');
      showModal(loginModal);
    } else {
      alert(ver.data.error || 'Verification failed');
    }
  });

  // Password Reset 
  document.querySelector('.resetSubmitBtn')?.addEventListener('click', async e => {
    e.preventDefault();
    alert('An email has been sent with a reset password link.');
  });

  // Default: show login on load
  showModal(loginModal);
});
