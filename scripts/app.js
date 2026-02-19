/* ============================================================
   FINTRACK – Main Application Entry Point
   Handles navigation, page routing, and app initialization
   ============================================================ */

// ──────────── State ────────────
let currentPage = 'about';

// ──────────── DOM References ────────────
const pages = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.app-nav__link');
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');

// ──────────── Navigation ────────────

/**
 * Navigate to a specific page section
 * @param {string} pageName – the data-page value to navigate to
 */
function navigateTo(pageName) {
  // Hide all pages
  pages.forEach(page => {
    page.classList.remove('is-active');
  });

  // Deactivate all nav links
  navLinks.forEach(link => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });

  // Show target page
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('is-active');
    currentPage = pageName;

    // Update document title for screen readers
    const pageTitle = targetPage.querySelector('h1');
    if (pageTitle) {
      document.title = `${pageTitle.textContent} | FinTrack`;
    }
  }

  // Activate the matching nav link
  const activeLink = document.querySelector(`.app-nav__link[data-page="${pageName}"]`);
  if (activeLink) {
    activeLink.classList.add('is-active');
    activeLink.setAttribute('aria-current', 'page');
  }

  // Close mobile nav if open
  closeNav();
}

// ──────────── Mobile Nav Toggle ────────────

function openNav() {
  mainNav.classList.add('is-open');
  mainNav.setAttribute('aria-hidden', 'false');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  mainNav.classList.remove('is-open');
  mainNav.setAttribute('aria-hidden', 'true');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
}

function toggleNav() {
  const isOpen = mainNav.classList.contains('is-open');
  if (isOpen) {
    closeNav();
  } else {
    openNav();
  }
}

// ──────────── Event Listeners ────────────

// Navigation click handlers
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    if (page) {
      navigateTo(page);
    }
  });
});

// Hamburger menu
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', toggleNav);
}

// Close nav on overlay click (mobile)
if (mainNav) {
  mainNav.addEventListener('click', (e) => {
    if (e.target === mainNav) {
      closeNav();
    }
  });
}

// Close nav on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
    closeNav();
    hamburgerBtn.focus();
  }
});

// "Add New" button on records page
const btnAddNew = document.getElementById('btn-add-new');
if (btnAddNew) {
  btnAddNew.addEventListener('click', () => navigateTo('add'));
}

// "Add Transaction" button on empty state
const btnAddFirst = document.getElementById('btn-add-first');
if (btnAddFirst) {
  btnAddFirst.addEventListener('click', () => navigateTo('add'));
}

// Cancel button on form
const btnCancel = document.getElementById('btn-cancel-txn');
if (btnCancel) {
  btnCancel.addEventListener('click', () => navigateTo('records'));
}

// ──────────── Responsive Nav Handling ────────────

// Show/hide nav properly on resize
function handleResize() {
  if (window.innerWidth >= 768) {
    // Desktop: nav is always visible
    mainNav.setAttribute('aria-hidden', 'false');
    mainNav.classList.remove('is-open');
  } else {
    // Mobile: nav hidden by default
    if (!mainNav.classList.contains('is-open')) {
      mainNav.setAttribute('aria-hidden', 'true');
    }
  }
}

window.addEventListener('resize', handleResize);
handleResize();

// ──────────── Initialize App ────────────

function init() {
  console.log('🏦 FinTrack initialized');
  navigateTo('about');
}

// Start the app
init();
