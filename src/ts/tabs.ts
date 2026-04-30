export const initTabs = (): void => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabBtns.length === 0 || tabPanels.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Знімаємо клас active з усіх кнопок і панелей
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // 2. Додаємо клас active на кнопку, по якій клікнули
      btn.classList.add('active');

      // 3. Знаходимо потрібну панель по data-tab і показуємо її
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        const targetPanel = document.getElementById(tabId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      }
    });
  });
};