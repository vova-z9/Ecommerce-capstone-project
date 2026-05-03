export function initSlider() {
  const track = document.getElementById("suitcase-track");
  const btnPrev = document.getElementById("suitcase-prev");
  const btnNext = document.getElementById("suitcase-next");

  if (!track || !btnPrev || !btnNext) return;

  let currentIndex = 0;

  const getSlidesPerView = () => {
    if (window.innerWidth <= 576) return 1;
    if (window.innerWidth <= 992) return 2;
    if (window.innerWidth <= 1024) return 3;
    return 4;
  };

  const updateSliderPosition = () => {
    const slide = track.firstElementChild as HTMLElement;
    if (!slide) return;

    const slideWidth = slide.offsetWidth + 20;
    const moveAmount = currentIndex * slideWidth;
    track.style.transform = `translateX(-${moveAmount}px)`;
  };

  btnNext.addEventListener("click", () => {
    const totalSlides = track.children.length;
    const slidesPerView = getSlidesPerView();

    if (currentIndex < totalSlides - slidesPerView) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  window.addEventListener("resize", updateSliderPosition);
}
