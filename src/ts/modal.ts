export const initLoginModal = (): void => {
  const openModalBtn = document.getElementById("open-login");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form") as HTMLFormElement;

  const emailInput = document.getElementById("login-email") as HTMLInputElement;
  const passwordInput = document.getElementById(
    "login-password",
  ) as HTMLInputElement;
  const togglePasswordBtn = document.getElementById("toggle-password");

  if (!loginModal || !loginForm || !openModalBtn) return;

  const closeModal = () => {
    loginModal.classList.add("is-hidden");
    document.body.style.overflow = "";
    loginForm.reset();
  };

  openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      closeModal();
    }
  });

  togglePasswordBtn?.addEventListener("click", () => {
    if (passwordInput) {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      togglePasswordBtn.classList.toggle("fa-eye");
      togglePasswordBtn.classList.toggle("fa-eye-slash");
    }
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      alert("Email format is incorrect!");
      return;
    }

    if (passwordValue === "") {
      alert("Password is required!");
      return;
    }

    console.log("Login successful");
    closeModal();
  });
};
