export const initLoginModal = (): void => {
  // Використовуємо прямий пошук за ID, який ти додав у HTML
  const openModalBtn = document.getElementById('open-login'); 
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const togglePasswordBtn = document.getElementById('toggle-password');
  
  console.log('Кнопка:', openModalBtn);

console.log('Модалка:', loginModal);

console.log('Форма:', loginForm);
  // Перевірка наявності головних елементів
  if (!loginModal || !loginForm || !openModalBtn) {
    console.error('Елементи модалки або кнопка відкриття не знайдені в DOM!');
    return;
  }

  const closeModal = () => {
    loginModal.classList.add('is-hidden');
    document.body.style.overflow = '';
    loginForm.reset();
  };

  // 1. Відкриття модалки
  openModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden'; // Забороняємо скрол сторінки під модалкою
  });

  // 2. Закриття по кліку на оверлей (темний фон навколо вікна)
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