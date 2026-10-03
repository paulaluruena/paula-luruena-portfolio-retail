document.documentElement.classList.add('js');

/* Mobile navigation */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menuButton && navigation) {
  const icon = menuButton.querySelector('span');
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    if (icon) icon.textContent = open ? '−' : '+';
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', () => setMenu(false));
}

/* Experience disclosures */
const experiences = [...document.querySelectorAll('.experience-item')];
const expandButton = document.querySelector('.expand-all');
if (expandButton && experiences.length) {
  expandButton.hidden = false;
  const updateLabel = () => {
    expandButton.textContent = experiences.every(item => item.open) ? 'Collapse all' : 'Expand all';
  };
  expandButton.addEventListener('click', () => {
    const open = !experiences.every(item => item.open);
    experiences.forEach(item => { item.open = open; });
    updateLabel();
  });
  experiences.forEach(item => item.addEventListener('toggle', updateLabel));
  updateLabel();
}
function openLinkedExperience() {
  const item = experiences.find(entry => `#${entry.id}` === location.hash);
  if (item) item.open = true;
}
window.addEventListener('hashchange', openLinkedExperience);
openLinkedExperience();

/* Reading progress and active navigation */
const progress = document.querySelector('.reading-progress');
const navLinks = navigation ? [...navigation.querySelectorAll('a[href^="#"]')] : [];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
let scheduled = false;
function updateReadingPosition() {
  scheduled = false;
  const remaining = document.documentElement.scrollHeight - innerHeight;
  if (progress) {
    const ratio = remaining > 0 ? Math.min(1, Math.max(0, scrollY / remaining)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  }
  let current = -1;
  sections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= 160) current = index;
  });
  navLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function schedule() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReadingPosition); }
}
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
document.addEventListener('toggle', schedule, true);
updateReadingPosition();

/* Gentle reveal on scroll (skipped when reduced motion is preferred) */
const revealItems = [...document.querySelectorAll('.reveal')];
if (revealItems.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('can-reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach(item => observer.observe(item));
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
