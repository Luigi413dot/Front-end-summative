/* ============================================================
   FINTRACK – Main Application Entry Point
   Handles navigation, page routing, form wiring, and init
   ============================================================ */

(function () {
  'use strict';

  // ──────────── State ────────────
  let currentPage = 'about';
  let deleteTargetId = null;

  // ──────────── DOM References ────────────
  const pages = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.app-nav__link');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mainNav = document.getElementById('main-nav');

  // Form elements
  const transactionForm = document.getElementById('transaction-form');
  const descInput = document.getElementById('txn-description');
  const amountInput = document.getElementById('txn-amount');
  const categorySelect = document.getElementById('txn-category');
  const dateInput = document.getElementById('txn-date');
  const editIdInput = document.getElementById('txn-edit-id');
  const formHeading = document.getElementById('form-heading');

  // Delete modal
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalConfirm = document.getElementById('delete-modal-confirm');
  const deleteModalCancel = document.getElementById('delete-modal-cancel');
  const deleteModalClose = document.getElementById('delete-modal-close');

  // Settings
  const settingsCurrency = document.getElementById('settings-currency');
  const rateUsd = document.getElementById('rate-usd');
  const rateEur = document.getElementById('rate-eur');
  const settingsBudgetCap = document.getElementById('settings-budget-cap');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnExportJSON = document.getElementById('btn-export-json');
  const btnImportJSON = document.getElementById('btn-import-json');
  const jsonFileInput = document.getElementById('json-file-input');

  // ──────────── Navigation ────────────

  function navigateTo(pageName) {
    pages.forEach(page => page.classList.remove('is-active'));
    navLinks.forEach(link => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
      targetPage.classList.add('is-active');
      currentPage = pageName;

      const pageTitle = targetPage.querySelector('h1');
      if (pageTitle) {
        document.title = `${pageTitle.textContent} | FinTrack`;
      }
    }

    const activeLink = document.querySelector(`.app-nav__link[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }

    closeNav();

    // Run page-specific logic
    if (pageName === 'records') renderRecords();
    if (pageName === 'dashboard') renderDashboard();
    if (pageName === 'settings') loadSettingsToForm();
    if (pageName === 'market') window.FinTrackScraper.init();
    if (pageName === 'tools') { /* Tools init if needed */ }
    if (pageName === 'add' && !window.AppState.editingId) resetForm();
  }

  // ──────────── Mobile Nav ────────────

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
    mainNav.classList.contains('is-open') ? closeNav() : openNav();
  }

  // ──────────── Form Handling ────────────

  function resetForm() {
    if (transactionForm) transactionForm.reset();
    if (editIdInput) editIdInput.value = '';
    if (formHeading) formHeading.textContent = 'Add Transaction';
    window.AppState.editingId = null;
    window.FinTrackValidators.clearAllErrors();
  }

  function getFormData() {
    return {
      description: descInput ? descInput.value : '',
      amount: amountInput ? amountInput.value : '',
      category: categorySelect ? categorySelect.value : '',
      date: dateInput ? dateInput.value : ''
    };
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = getFormData();
    const result = window.FinTrackValidators.validateForm(formData);

    // Apply validation to DOM
    window.FinTrackValidators.applyValidationToDOM(result);

    if (!result.isValid) {
      // Focus the first invalid field
      const firstErrorField = Object.keys(result.errors)[0];
      const rule = window.FinTrackValidators.VALIDATION_RULES[firstErrorField];
      if (rule) {
        const el = document.getElementById(rule.fieldId);
        if (el) el.focus();
      }
      return;
    }

    // Save the record
    const editId = editIdInput ? editIdInput.value : '';
    if (editId) {
      window.AppState.updateRecord(editId, formData);
      showToast('Transaction updated successfully!', 'success');
    } else {
      window.AppState.addRecord(formData);
      showToast('Transaction added successfully!', 'success');
    }

    resetForm();
    navigateTo('records');
  }

  // ──────────── Live Validation ────────────

  function setupLiveValidation() {
    const fields = [
      { input: descInput, ruleName: 'description' },
      { input: amountInput, ruleName: 'amount' },
      { input: categorySelect, ruleName: 'category' },
      { input: dateInput, ruleName: 'date' }
    ];

    fields.forEach(({ input, ruleName }) => {
      if (!input) return;

      input.addEventListener('blur', () => {
        const value = input.value;
        const rule = window.FinTrackValidators.VALIDATION_RULES[ruleName];
        const result = window.FinTrackValidators.validateField(ruleName, value);

        if (!result.valid) {
          window.FinTrackValidators.showFieldError(rule.fieldId, rule.errorId, result.message);
        } else {
          window.FinTrackValidators.clearFieldError(rule.fieldId, rule.errorId);
        }

        // Check duplicate words on description
        if (ruleName === 'description' && value) {
          const dupCheck = window.FinTrackValidators.checkDuplicateWords(value);
          const dupWarning = document.getElementById('duplicate-word-warning');
          if (dupWarning) {
            if (dupCheck.hasDuplicates) {
              dupWarning.textContent = `⚠ Duplicate word detected: "${dupCheck.match}"`;
              dupWarning.hidden = false;
              dupWarning.classList.add('is-visible');
            } else {
              dupWarning.hidden = true;
              dupWarning.classList.remove('is-visible');
            }
          }
        }
      });
    });
  }

  // ──────────── Records Rendering ────────────

  function renderRecords() {
    const sortSelect = document.getElementById('sort-select');
    const sortKey = sortSelect ? sortSelect.value : 'date-desc';
    const records = window.AppState.getRecords(sortKey);
    const searchInput = document.getElementById('search-input');
    const caseToggle = document.getElementById('search-case-toggle');
    const searchValue = searchInput ? searchInput.value.trim() : '';

    let filteredRecords = records;
    let searchRegex = null;

    // Apply search filter
    if (searchValue) {
      const flags = caseToggle && caseToggle.checked ? 'gi' : 'g';
      searchRegex = window.FinTrackValidators.compileRegex(searchValue, flags);
      if (searchRegex) {
        filteredRecords = filteredRecords.filter(r =>
          searchRegex.test(r.description) ||
          searchRegex.test(r.category) ||
          searchRegex.test(r.amount.toString()) ||
          searchRegex.test(r.date)
        );
        // Reset lastIndex for global regex
        searchRegex.lastIndex = 0;
      }
    }

    // Apply category filter (Milestone 6)
    const categoryFilter = window.FinTrackM6 ? window.FinTrackM6.getCategoryFilter() : 'all';
    if (categoryFilter !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.category === categoryFilter);
    }

    // Update count
    const countEl = document.getElementById('records-count');
    if (countEl) countEl.textContent = `${filteredRecords.length} record${filteredRecords.length !== 1 ? 's' : ''}`;

    // Show empty state if no records
    const emptyState = document.getElementById('records-empty');
    const tableWrapper = document.getElementById('records-table-wrapper');
    const cardsWrapper = document.getElementById('records-cards');

    if (filteredRecords.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (cardsWrapper) cardsWrapper.style.display = 'none';
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (tableWrapper) tableWrapper.style.display = '';
      if (cardsWrapper) cardsWrapper.style.display = '';
    }

    // Render table rows
    const tbody = document.getElementById('records-tbody');
    if (tbody) {
      tbody.innerHTML = filteredRecords.map(r => {
        const desc = searchRegex
          ? window.FinTrackValidators.highlight(escapeHtml(r.description), searchRegex)
          : escapeHtml(r.description);
        const catClass = r.category.toLowerCase().replace(/\s+/g, '-');
        return `
          <tr>
            <td>${desc}</td>
            <td>${formatCurrency(r.amount)}</td>
            <td><span class="badge badge--${catClass}">${escapeHtml(r.category)}</span></td>
            <td>${r.date}</td>
            <td>
              <button class="btn btn--sm btn--ghost" aria-label="Edit ${escapeHtml(r.description)}" data-edit="${r.id}">✏️</button>
              <button class="btn btn--sm btn--ghost" aria-label="Delete ${escapeHtml(r.description)}" data-delete="${r.id}">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Render mobile cards
    if (cardsWrapper) {
      cardsWrapper.innerHTML = filteredRecords.map(r => {
        const desc = searchRegex
          ? window.FinTrackValidators.highlight(escapeHtml(r.description), searchRegex)
          : escapeHtml(r.description);
        const catClass = r.category.toLowerCase().replace(/\s+/g, '-');
        return `
          <div class="record-card" role="listitem">
            <div class="record-card__header">
              <span class="record-card__title">${desc}</span>
              <span class="record-card__amount">${formatCurrency(r.amount)}</span>
            </div>
            <div class="record-card__meta">
              <span class="badge badge--${catClass}">${escapeHtml(r.category)}</span>
              <span>${r.date}</span>
            </div>
            <div class="record-card__actions">
              <button class="btn btn--sm btn--secondary" aria-label="Edit ${escapeHtml(r.description)}" data-edit="${r.id}">✏️ Edit</button>
              <button class="btn btn--sm btn--danger" aria-label="Delete ${escapeHtml(r.description)}" data-delete="${r.id}">🗑️ Delete</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ──────────── Dashboard ────────────

  function renderDashboard() {
    const records = window.AppState.records;
    const settings = window.AppState.settings;

    // Total records
    const totalRecordsEl = document.getElementById('stat-total-records');
    if (totalRecordsEl) totalRecordsEl.textContent = records.length;

    // Total spent
    const totalSpent = records.reduce((sum, r) => sum + r.amount, 0);
    const totalSpentEl = document.getElementById('stat-total-spent');
    if (totalSpentEl) totalSpentEl.textContent = formatCurrency(totalSpent);

    // Top category
    const catTotals = {};
    records.forEach(r => { catTotals[r.category] = (catTotals[r.category] || 0) + r.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    const topCatEl = document.getElementById('stat-top-category');
    if (topCatEl) topCatEl.textContent = topCat ? topCat[0] : '—';

    // Average transaction
    const avgEl = document.getElementById('stat-avg-transaction');
    if (avgEl) avgEl.textContent = records.length > 0 ? formatCurrency(totalSpent / records.length) : formatCurrency(0);

    // Charts
    renderChart(records);
    renderCategoryPie(records);
    if (window.FinTrackM6) window.FinTrackM6.renderDashboard();

    // Budget cap
    renderBudget(totalSpent, settings);
  }

  /**
   * Simple Category Distribution visualization (Milestone 4)
   * Using a conic-gradient for a simple pie chart effect
   */
  function renderCategoryPie(records) {
    const pieContainer = document.getElementById('category-pie');
    const legendContainer = document.getElementById('category-legend');
    if (!pieContainer || !legendContainer) return;

    if (records.length === 0) {
      pieContainer.style.background = 'var(--color-bg-tertiary)';
      legendContainer.innerHTML = '<li>No data</li>';
      return;
    }

    const totals = {};
    let totalAll = 0;
    records.forEach(r => {
      totals[r.category] = (totals[r.category] || 0) + r.amount;
      totalAll += r.amount;
    });

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    let currentDegree = 0;
    const gradientParts = [];
    legendContainer.innerHTML = '';

    Object.entries(totals).forEach(([cat, amt], i) => {
      const pct = (amt / totalAll) * 100;
      const deg = (pct / 100) * 360;
      const color = colors[i % colors.length];

      gradientParts.push(`${color} ${currentDegree}deg ${(currentDegree + deg)}deg`);
      currentDegree += deg;

      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.gap = '8px'; // var(--sp-2)
      li.style.fontSize = '12px'; // var(--fs-xs)
      li.innerHTML = `<span style="width:10px;height:10px;background:${color};border-radius:2px;"></span> ${cat} (${Math.round(pct)}%)`;
      legendContainer.appendChild(li);
    });

    pieContainer.style.background = `conic-gradient(${gradientParts.join(', ')})`;
  }

  function renderChart(records) {
    const bars = document.querySelectorAll('#chart-7day .chart-bar__fill');
    const labels = document.querySelectorAll('#chart-7day .chart-bar__label');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const today = new Date();
    const dayTotals = new Array(7).fill(0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayIdx = i;

      dayTotals[dayIdx] = records
        .filter(r => r.date === dateStr)
        .reduce((sum, r) => sum + r.amount, 0);

      if (labels[i]) labels[i].textContent = days[d.getDay()];
    }

    const maxVal = Math.max(...dayTotals, 1);
    bars.forEach((bar, i) => {
      const pct = (dayTotals[i] / maxVal) * 100;
      bar.style.height = `${Math.max(pct, 2)}%`;
    });
  }

  function renderBudget(totalSpent, settings) {
    const cap = settings.budgetCap || 0;
    const fractionEl = document.getElementById('budget-fraction');
    const progressEl = document.getElementById('budget-progress');
    const statusEl = document.getElementById('budget-status');

    if (cap <= 0) {
      if (fractionEl) fractionEl.textContent = 'No cap set';
      if (progressEl) { progressEl.style.width = '0%'; progressEl.className = 'progress__fill'; }
      if (statusEl) statusEl.textContent = 'Set a budget cap in Settings to track your spending.';
      return;
    }

    const pct = Math.min((totalSpent / cap) * 100, 100);
    const remaining = cap - totalSpent;

    if (fractionEl) fractionEl.textContent = `${formatCurrency(totalSpent)} / ${formatCurrency(cap)}`;
    if (progressEl) {
      progressEl.style.width = `${pct}%`;
      progressEl.className = 'progress__fill';
      if (pct >= 100) progressEl.classList.add('progress__fill--danger');
      else if (pct >= 80) progressEl.classList.add('progress__fill--warning');
    }

    if (statusEl) {
      if (remaining >= 0) {
        statusEl.textContent = `✓ ${formatCurrency(remaining)} remaining`;
        statusEl.setAttribute('aria-live', 'polite');
      } else {
        statusEl.textContent = `⚠ Over budget by ${formatCurrency(Math.abs(remaining))}!`;
        statusEl.setAttribute('aria-live', 'assertive');
      }
    }
  }

  // ──────────── Settings ────────────

  function loadSettingsToForm() {
    const settings = window.AppState.settings;
    if (settingsCurrency) settingsCurrency.value = settings.baseCurrency;
    if (rateUsd) rateUsd.value = settings.rates.USD || '';
    if (rateEur) rateEur.value = settings.rates.EUR || '';
    if (settingsBudgetCap) settingsBudgetCap.value = settings.budgetCap || '';
  }

  function handleSaveSettings() {
    const newSettings = {
      baseCurrency: settingsCurrency ? settingsCurrency.value : 'ZAR',
      rates: {
        USD: parseFloat(rateUsd ? rateUsd.value : 0) || 0,
        EUR: parseFloat(rateEur ? rateEur.value : 0) || 0
      },
      budgetCap: parseFloat(settingsBudgetCap ? settingsBudgetCap.value : 0) || 0
    };
    window.AppState.updateSettings(newSettings);
    showToast('Settings saved!', 'success');
  }

  // ──────────── Delete Modal ────────────

  function openDeleteModal(id) {
    deleteTargetId = id;
    const record = window.AppState.getRecord(id);
    const textEl = document.getElementById('delete-modal-text');
    if (textEl && record) {
      textEl.textContent = `Are you sure you want to delete "${record.description}"? This cannot be undone.`;
    }
    if (deleteModal) {
      deleteModal.classList.add('is-open');
      if (deleteModalCancel) deleteModalCancel.focus();
    }
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    if (deleteModal) deleteModal.classList.remove('is-open');
  }

  function confirmDelete() {
    if (deleteTargetId) {
      window.AppState.deleteRecord(deleteTargetId);
      showToast('Transaction deleted.', 'success');
      closeDeleteModal();
      renderRecords();
      renderDashboard();
    }
  }

  // ──────────── Edit ────────────

  function startEdit(id) {
    const record = window.AppState.getRecord(id);
    if (!record) return;

    window.AppState.editingId = id;
    if (descInput) descInput.value = record.description;
    if (amountInput) amountInput.value = record.amount;
    if (categorySelect) categorySelect.value = record.category;
    if (dateInput) dateInput.value = record.date;
    if (editIdInput) editIdInput.value = record.id;
    if (formHeading) formHeading.textContent = 'Edit Transaction';

    window.FinTrackValidators.clearAllErrors();
    navigateTo('add');
    if (descInput) descInput.focus();
  }

  // ──────────── Import/Export ────────────

  function handleExport() {
    window.FinTrackStorage.exportToJSON(window.AppState.records);
    showToast('Data exported!', 'success');
  }

  function handleImport() {
    if (jsonFileInput) jsonFileInput.click();
  }

  function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        const validation = window.FinTrackStorage.validateImportData(data);
        if (!validation.valid) {
          showToast(`Import failed: ${validation.message}`, 'error');
          return;
        }
        window.AppState.replaceRecords(validation.data);
        showToast(`Imported ${validation.data.length} records!`, 'success');
        renderRecords();
        renderDashboard();
      } catch (err) {
        showToast('Import failed: Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset the input so re-importing the same file works
    e.target.value = '';
  }

  // ──────────── Toast ────────────

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ──────────── Utility ────────────

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Format currency based on current settings and rates.
   * Assumes internal store is in ZAR.
   */
  function formatCurrency(amount) {
    const appSettings = window.AppState.settings || { baseCurrency: 'ZAR', rates: { USD: 0.055, EUR: 0.051 } };
    const currency = appSettings.baseCurrency || 'ZAR';
    const rate = (currency === 'ZAR') ? 1 : (appSettings.rates[currency] || 1);
    const symbols = { 'ZAR': 'R', 'USD': '$', 'EUR': '€' };
    const symbol = symbols[currency] || 'R';

    const converted = amount * rate;
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // ──────────── Event Delegation ────────────

  // Edit/Delete buttons in records (delegation)
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const deleteBtn = e.target.closest('[data-delete]');

    if (editBtn) {
      startEdit(editBtn.getAttribute('data-edit'));
    }
    if (deleteBtn) {
      openDeleteModal(deleteBtn.getAttribute('data-delete'));
    }
  });

  // ──────────── Wire Up Events ────────────

  function bindEvents() {
    // Navigation
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        if (page) navigateTo(page);
      });
    });

    // Hamburger
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleNav);

    // Nav overlay close
    if (mainNav) mainNav.addEventListener('click', (e) => {
      if (e.target === mainNav) closeNav();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (deleteModal && deleteModal.classList.contains('is-open')) {
          closeDeleteModal();
        } else if (mainNav.classList.contains('is-open')) {
          closeNav();
          hamburgerBtn.focus();
        }
      }
    });

    // Form submission
    if (transactionForm) transactionForm.addEventListener('submit', handleFormSubmit);

    // Cancel button
    const btnCancel = document.getElementById('btn-cancel-txn');
    if (btnCancel) btnCancel.addEventListener('click', () => { resetForm(); navigateTo('records'); });

    // Add new buttons
    const btnAddNew = document.getElementById('btn-add-new');
    if (btnAddNew) btnAddNew.addEventListener('click', () => { resetForm(); navigateTo('add'); });

    const btnAddFirst = document.getElementById('btn-add-first');
    if (btnAddFirst) btnAddFirst.addEventListener('click', () => { resetForm(); navigateTo('add'); });

    // Delete modal
    if (deleteModalConfirm) deleteModalConfirm.addEventListener('click', confirmDelete);
    if (deleteModalCancel) deleteModalCancel.addEventListener('click', closeDeleteModal);
    if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);

    // Settings
    if (btnSaveSettings) btnSaveSettings.addEventListener('click', handleSaveSettings);
    if (btnExportJSON) btnExportJSON.addEventListener('click', handleExport);
    if (btnImportJSON) btnImportJSON.addEventListener('click', handleImport);
    if (jsonFileInput) jsonFileInput.addEventListener('change', handleFileSelected);

    // Sort change
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', renderRecords);

    // Search input
    const searchInput = document.getElementById('search-input');
    const caseToggle = document.getElementById('search-case-toggle');
    if (searchInput) searchInput.addEventListener('input', renderRecords);
    if (caseToggle) caseToggle.addEventListener('change', renderRecords);

    // Live validation
    setupLiveValidation();
  }

  // ──────────── Responsive ────────────

  function handleResize() {
    if (window.innerWidth >= 768) {
      mainNav.setAttribute('aria-hidden', 'false');
      mainNav.classList.remove('is-open');
    } else {
      if (!mainNav.classList.contains('is-open')) {
        mainNav.setAttribute('aria-hidden', 'true');
      }
    }
  }

  window.addEventListener('resize', handleResize);

  // ──────────── Init ────────────

  function init() {
    window.AppState.init();
    window.FinTrackM5.init();
    if (window.FinTrackM6) window.FinTrackM6.init();
    handleResize();
    bindEvents();
    navigateTo('about');
    console.log('🏦 FinTrack initialized');
  }

  // ──────────── Exports ────────────
  window.FinTrackApp = {
    renderRecords,
    renderDashboard,
    navigateTo,
    showToast
  };

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
