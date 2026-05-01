export function initTabs() {
  // Знаходимо всі кнопки табів і всі блоки з контентом
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Перебираємо кожну кнопку і вішаємо на неї "слухач" кліку
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 1. Знімаємо клас 'active' з УСІХ кнопок і панелей
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      // 2. Додаємо 'active' тій кнопці, на яку щойно клікнули
      btn.classList.add("active");

      // 3. Читаємо атрибут data-tab (наприклад, "tab-reviews")
      const targetId = btn.getAttribute("data-tab");

      // 4. Знаходимо блок з таким ID і показуємо його
      if (targetId) {
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add("active");
        }
      }
    });
  });
}
