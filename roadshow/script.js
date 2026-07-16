const slides = [...document.querySelectorAll('.slide')];
const nav = document.querySelector('#deck-nav');
const current = document.querySelector('#current');
const total = document.querySelector('#total');
const progress = document.querySelector('#progress');
let activeIndex = 0;

total.textContent = String(slides.length).padStart(2, '0');

slides.forEach((slide, index) => {
  const link = document.createElement('a');
  link.href = `#${slide.id}`;
  link.setAttribute('aria-label', `第${index + 1}页：${slide.dataset.short || ''}`);
  link.title = slide.dataset.short || `第${index + 1}页`;
  nav.appendChild(link);
});

const dots = [...nav.querySelectorAll('a')];

function setActive(index) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  current.textContent = String(activeIndex + 1).padStart(2, '0');
  progress.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeIndex));
}

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(slides.indexOf(visible.target));
}, { threshold: [0.42, 0.68] });

slides.forEach((slide) => observer.observe(slide));

const initialIndex = slides.findIndex((slide) => `#${slide.id}` === location.hash);
setActive(initialIndex >= 0 ? initialIndex : 0);
if (initialIndex >= 0) {
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  root.style.scrollSnapType = 'none';
  slides[initialIndex].scrollIntoView({ behavior: 'instant', block: 'start' });
  requestAnimationFrame(() => {
    root.style.scrollBehavior = '';
    root.style.scrollSnapType = '';
  });
}

window.addEventListener('hashchange', () => {
  const hashIndex = slides.findIndex((slide) => `#${slide.id}` === location.hash);
  if (hashIndex >= 0) setActive(hashIndex);
});

window.addEventListener('keydown', (event) => {
  const keys = ['ArrowDown', 'ArrowRight', 'PageDown', 'ArrowUp', 'ArrowLeft', 'PageUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') activeIndex = 0;
  else if (event.key === 'End') activeIndex = slides.length - 1;
  else activeIndex += ['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1;
  activeIndex = Math.max(0, Math.min(slides.length - 1, activeIndex));
  slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const choiceButtons = [...document.querySelectorAll('#choice-board button')];
const choiceResult = document.querySelector('#choice-result');

choiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    choiceButtons.forEach((item) => item.classList.toggle('is-selected', item === button));
    choiceResult.innerHTML = `你选择了<strong>${button.dataset.choice}</strong>。产品不会马上宣布对错，而会让你带着这个判断去阅读命令、地图和回忆材料。`;
    choiceResult.classList.add('is-visible');
  });
});
