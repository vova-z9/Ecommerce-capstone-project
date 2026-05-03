export function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");

      const targetId = btn.getAttribute("data-tab");

      if (targetId) {
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add("active");
        }
      }
    });
  });
}
