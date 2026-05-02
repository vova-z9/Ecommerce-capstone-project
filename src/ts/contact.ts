export const initContactForm = (): void => {
  // Знаходимо форму та всі елементи
  const contactForm = document.getElementById(
    "contact-form",
  ) as HTMLFormElement;
  const nameInput = document.getElementById("contact-name") as HTMLInputElement;
  const emailInput = document.getElementById(
    "contact-email",
  ) as HTMLInputElement;
  const topicInput = document.getElementById("topic") as HTMLInputElement; // Додали Topic
  const messageInput = document.getElementById(
    "contact-message",
  ) as HTMLTextAreaElement;
  const statusDiv = document.getElementById("form-status") as HTMLDivElement;

  // Якщо ми не на сторінці контактів — виходимо
  if (!contactForm) return;

  const inputs = [nameInput, emailInput, topicInput, messageInput];

  // Функція для перевірки Email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Універсальна функція перевірки одного поля
  const validateField = (input: HTMLInputElement | HTMLTextAreaElement) => {
    if (!input) return false;

    const formGroup = input.parentElement;
    if (!formGroup) return false;

    let isValid = true;
    const value = input.value.trim();

    // 1. Перевірка на пустоту
    if (value === "") {
      isValid = false;
    }
    // 2. Якщо це email — перевіряємо формат
    else if (input.type === "email" && !isValidEmail(value)) {
      isValid = false;
    }

    // Візуально показуємо результат (додаємо/забираємо класи з нашого SCSS)
    if (!isValid) {
      input.classList.add("invalid"); // Червона рамка
      formGroup.classList.add("has-error"); // Показує текст помилки
    } else {
      input.classList.remove("invalid");
      formGroup.classList.remove("has-error");
    }

    return isValid;
  };

  // === ТЗ: REAL-TIME VALIDATION ===
  // Перевіряємо поля відразу, коли користувач вводить текст або клікає в інше місце
  inputs.forEach((input) => {
    if (input) {
      input.addEventListener("input", () => validateField(input));
      input.addEventListener("blur", () => validateField(input)); // blur - коли прибрали курсор з поля
    }
  });

  // === ТЗ: ON SUBMIT ===
  contactForm.addEventListener("submit", (e) => {
    // 🛑 Зупиняємо перезавантаження сторінки!
    e.preventDefault();

    let isFormValid = true;

    // При кліку SEND перевіряємо примусово всі поля ще раз
    inputs.forEach((input) => {
      if (input && !validateField(input)) {
        isFormValid = false;
      }
    });

    // Якщо всі перевірки пройдені успішно:
    if (isFormValid) {
      console.log("Form data ready to send:", {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        topic: topicInput.value.trim(),
        message: messageInput.value.trim(),
      });

      // Показуємо красиве повідомлення про успіх (замість alert)
      if (statusDiv) {
        statusDiv.textContent =
          "Thank you! Your message has been sent successfully.";
        statusDiv.className = "form-status success"; // Додає зелений фон з SCSS
      }

      // Очищаємо всі поля форми
      contactForm.reset();

      // Забираємо всі зелені/червоні рамки після очищення
      inputs.forEach((input) => {
        if (input) {
          input.classList.remove("invalid");
          input.parentElement?.classList.remove("has-error");
        }
      });

      // Ховаємо повідомлення про успіх через 5 секунд, щоб було акуратно
      setTimeout(() => {
        if (statusDiv) {
          statusDiv.className = "form-status";
        }
      }, 5000);
    }
  });
};
