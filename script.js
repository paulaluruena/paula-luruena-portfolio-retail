document.documentElement.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile navigation ---------- */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menuButton && navigation) {
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));
}

/* ---------- Tabs ---------- */
document.querySelectorAll('.tabs').forEach(group => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on) { panels[i].classList.remove('is-entering'); void panels[i].offsetWidth; panels[i].classList.add('is-entering'); }
    });
    if (focus) tabs[index].focus();
    group.style.setProperty('--active', index);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', e => {
      const last = tabs.length - 1;
      const keys = { ArrowRight: i === last ? 0 : i + 1, ArrowDown: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last };
      if (e.key in keys) { e.preventDefault(); select(keys[e.key], true); }
    });
  });
  select(Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')));
});

/* ---------- Experience explorer ---------- */
const explorer = document.querySelector('.explorer');
let explorerApi = null;
if (explorer) {
  explorer.classList.add('is-enhanced');
  const filterButtons = [...explorer.querySelectorAll('[data-filter]')];
  const navButtons = [...explorer.querySelectorAll('[data-role]')];
  const panels = navButtons.map(b => document.getElementById(b.dataset.role));
  const status = explorer.querySelector('.filter-status');
  const statusText = status && status.querySelector('span');
  const clearButton = status && status.querySelector('button');
  let current = null;

  const showRole = (id, focusPanel) => {
    navButtons.forEach((b, i) => {
      const on = b.dataset.role === id;
      b.setAttribute('aria-current', on ? 'true' : 'false');
      panels[i].hidden = !on;
      if (on && current !== id) { panels[i].classList.remove('is-entering'); void panels[i].offsetWidth; panels[i].classList.add('is-entering'); }
    });
    current = id;
    if (focusPanel) document.getElementById(id).focus({ preventScroll: true });
  };

  const applyFilter = (matches, label) => {
    let firstVisible = null;
    navButtons.forEach(b => {
      const visible = matches(b);
      b.parentElement.hidden = !visible;
      if (visible && !firstVisible) firstVisible = b.dataset.role;
    });
    const currentVisible = navButtons.some(b => b.dataset.role === current && !b.parentElement.hidden);
    if (!currentVisible && firstVisible) showRole(firstVisible);
    if (status) {
      status.hidden = !label;
      if (label) {
        const count = navButtons.filter(b => !b.parentElement.hidden).length;
        statusText.textContent = `${count} ${count === 1 ? 'role' : 'roles'} ${label}`;
      }
    }
  };

  const setCategory = cat => {
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    applyFilter(b => cat === 'all' || b.dataset.cats.split(' ').includes(cat), null);
  };

  filterButtons.forEach(b => b.addEventListener('click', () => setCategory(b.dataset.filter)));
  navButtons.forEach(b => b.addEventListener('click', () => {
    showRole(b.dataset.role);
    if (matchMedia('(max-width: 860px)').matches) {
      document.getElementById(b.dataset.role).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }));
  if (clearButton) clearButton.addEventListener('click', () => { setCategory('all'); (filterButtons[0] || navButtons[0]).focus(); });

  explorerApi = {
    showSkill(skill, label) {
      filterButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      const roles = navButtons.filter(b => (b.dataset.skills || '').split(' ').includes(skill));
      applyFilter(b => roles.includes(b), `where I used ${label}`);
      if (roles[0]) showRole(roles[0].dataset.role);
      explorer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    },
    showRole(id) {
      setCategory('all');
      showRole(id);
      explorer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    },
    has: id => navButtons.some(b => b.dataset.role === id)
  };

  setCategory('all');
  showRole(navButtons[0].dataset.role);
}

/* Skill buttons anywhere on the page filter the explorer */
document.querySelectorAll('[data-show-skill]').forEach(button => {
  button.addEventListener('click', () => {
    if (explorerApi) explorerApi.showSkill(button.dataset.showSkill, button.dataset.label || button.textContent.trim());
  });
});

/* Links to a specific role open it in the explorer */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || !explorerApi) return;
  const id = link.getAttribute('href').slice(1);
  if (explorerApi.has(id)) { e.preventDefault(); explorerApi.showRole(id); history.replaceState(null, '', `#${id}`); }
});
if (explorerApi && location.hash && explorerApi.has(location.hash.slice(1))) explorerApi.showRole(location.hash.slice(1));

/* ---------- Copy email ---------- */
document.querySelectorAll('[data-copy]').forEach(button => {
  const original = button.textContent;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select and copy the address';
    }
    button.classList.add('is-done');
    setTimeout(() => { button.textContent = original; button.classList.remove('is-done'); }, 2200);
  });
});

/* ---------- Reading progress and active navigation ---------- */
const progress = document.querySelector('.reading-progress');
const navLinks = navigation ? [...navigation.querySelectorAll('a[href^="#"]')] : [];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
const header = document.querySelector('.site-header');
let scheduled = false;
function updatePosition() {
  scheduled = false;
  const remaining = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${remaining > 0 ? Math.min(1, Math.max(0, scrollY / remaining)) : 0})`;
  if (header) header.classList.toggle('is-scrolled', scrollY > 8);
  let active = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 140) active = i; });
  navLinks.forEach((l, i) => i === active ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current'));
}
const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updatePosition); } };
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
updatePosition();

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
