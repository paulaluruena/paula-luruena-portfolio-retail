document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);

const experiences = [...document.querySelectorAll('.experience-item')];
const expandButton = document.querySelector('.expand-all');
expandButton.hidden = false;
function updateExpandLabel() {
  expandButton.textContent = experiences.every(item => item.open)
    ? 'Collapse all experiences' : 'Expand all experiences';
}
expandButton.addEventListener('click', () => {
  const open = !experiences.every(item => item.open);
  experiences.forEach(item => { item.open = open; });
  updateExpandLabel();
});
experiences.forEach(item => item.addEventListener('toggle', updateExpandLabel));
function openLinkedExperience() {
  const item = experiences.find(item => `#${item.id}` === location.hash);
  if (item) item.open = true;
}
window.addEventListener('hashchange', openLinkedExperience);
openLinkedExperience();

const progress = document.querySelector('.reading-progress');
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
let scheduled = false;
function updateReadingPosition() {
  scheduled = false;
  const remaining = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${remaining > 0 ? Math.min(1, Math.max(0, scrollY / remaining)) : 0})`;
  let current = -1;
  sections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= 150) current = index;
  });
  navLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function schedulePositionUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReadingPosition); }
}
window.addEventListener('scroll', schedulePositionUpdate, { passive: true });
window.addEventListener('resize', schedulePositionUpdate);
document.addEventListener('toggle', schedulePositionUpdate, true);
updateReadingPosition();
document.querySelector('#year').textContent = new Date().getFullYear();
