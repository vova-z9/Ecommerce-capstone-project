export const initContactForm = (): void => {
  // Знаходимо форму та інпути (перевір, щоб ці ID збігалися з твоїм HTML)
  const contactForm = document.getElementById('contact-form') as HTMLFormElement;
  const nameInput = document.getElementById('contact-name') as HTMLInputElement;
  const emailInput = document.getElementById('contact-email') as HTMLInputElement;
  const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement;

  // Якщо ми не на сторінці контактів і форми немає — просто виходимо
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    // 🛑 САМЕ ЦЕЙ РЯДОК ЗУПИНЯЄ ПЕРЕЗАВАНТАЖЕННЯ СТОРІНКИ!
    e.preventDefault();

    // Беремо значення і забираємо зайві пробіли по краях
    const nameValue = nameInput?.value.trim();
    const emailValue = emailInput?.value.trim();
    const messageValue = messageInput?.value.trim();

    // 1. Перевірка імені (просто щоб не було пустим)
    if (!nameValue || nameValue === '') {
      alert('Please enter your name.');
      return; // Зупиняємо відправку
    }

    // 2. Перевірка Email (через RegEx)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      alert('Please enter a valid email address.');
      return;
    }

    // 3. Перевірка повідомлення (щоб не пусте)
    if (!messageValue || messageValue === '') {
      alert('Please enter your message.');
      return;
    }

    // Якщо всі перевірки пройдені успішно:
    console.log('Form data:', { name: nameValue, email: emailValue, message: messageValue });
    alert('Thank you! Your message has been sent successfully.');
    
    // Очищаємо всі поля форми після відправки
    contactForm.reset();
  });
};