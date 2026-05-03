export const initContactForm = (): void => {
  const contactForm = document.getElementById(
    "contact-form",
  ) as HTMLFormElement;
  const nameInput = document.getElementById("contact-name") as HTMLInputElement;
  const emailInput = document.getElementById(
    "contact-email",
  ) as HTMLInputElement;
  const topicInput = document.getElementById("topic") as HTMLInputElement;
  const messageInput = document.getElementById(
    "contact-message",
  ) as HTMLTextAreaElement;
  const statusDiv = document.getElementById("form-status") as HTMLDivElement;

  if (!contactForm) return;

  const inputs = [nameInput, emailInput, topicInput, messageInput];

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (input: HTMLInputElement | HTMLTextAreaElement) => {
    if (!input) return false;

    const formGroup = input.parentElement;
    if (!formGroup) return false;

    let isValid = true;
    const value = input.value.trim();

    if (value === "" || (input.type === "email" && !isValidEmail(value))) {
      isValid = false;
    }

    if (!isValid) {
      input.classList.add("invalid");
      formGroup.classList.add("has-error");
    } else {
      input.classList.remove("invalid");
      formGroup.classList.remove("has-error");
    }

    return isValid;
  };

  inputs.forEach((input) => {
    if (input) {
      input.addEventListener("input", () => validateField(input));
      input.addEventListener("blur", () => validateField(input));
    }
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let isFormValid = true;

    inputs.forEach((input) => {
      if (input && !validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      console.log("Form data ready to send:", {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        topic: topicInput.value.trim(),
        message: messageInput.value.trim(),
      });

      if (statusDiv) {
        statusDiv.textContent =
          "Thank you! Your message has been sent successfully.";
        statusDiv.className = "form-status success";
      }

      contactForm.reset();

      inputs.forEach((input) => {
        if (input) {
          input.classList.remove("invalid");
          input.parentElement?.classList.remove("has-error");
        }
      });

      setTimeout(() => {
        if (statusDiv) {
          statusDiv.className = "form-status";
        }
      }, 5000);
    }
  });
};
