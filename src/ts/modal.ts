export const initLoginModal = (): void => {
  const openModalBtn = document.getElementById('open-login'); 
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const togglePasswordBtn = document.getElementById('toggle-password');

  if (!loginModal || !loginForm || !openModalBtn) return;

  // 1. ЗМІНИЛИ ЗАКРИТТЯ:
  const closeModal = () => {
    loginModal.classList.add('is-hidden'); 
    document.body.style.overflow = '';
    loginForm.reset();
  };

  // 2. ПРАВИЛЬНЕ ВІДКРИТТЯ:
  openModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('is-hidden'); 
    document.body.style.overflow = 'hidden'; 
  });

  // Закриття по кліку на оверлей
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      closeModal();
    }
  });

  // 3. Логіка перемикача "ока" (Показати/Сховати пароль)
  togglePasswordBtn?.addEventListener('click', () => {
    if (passwordInput) {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      // Міняємо іконку FontAwesome
      togglePasswordBtn.classList.toggle('fa-eye');
      togglePasswordBtn.classList.toggle('fa-eye-slash');
    }
  });

  // 4. Валідація та відправка форми
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    
    // RegEx згідно з вимогами ТЗ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      alert('Email format is incorrect!');
      return;
    }

    if (passwordValue === '') {
      alert('Password is required!');
      return;
    }

    // Успішний вхід
    console.log('Login successful');
    closeModal();
  });
};