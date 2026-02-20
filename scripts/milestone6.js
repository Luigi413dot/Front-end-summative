/* ============================================================
   FINTRACK – Milestone 6 Features
   Monthly Analytics, Category Filtering, and CSV Export
   ============================================================ */

(function () {
    'use strict';

    // ──────────── Monthly Spending History ────────────

    function renderMonthlyChart() {
        const records = window.AppState.records;
        const bars = document.querySelectorAll('#chart-monthly .chart-bar__fill');
        const labels = document.querySelectorAll('#chart-monthly .chart-bar__label');
        if (!bars.length || !labels.length) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const monthlyTotals = new Array(6).fill(0);
        const monthNames = new Array(6).fill('');

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
            const m = d.getMonth();
            const y = d.getFullYear();

            monthNames[i] = `${months[m]} ${y.toString().slice(-2)}`;

            monthlyTotals[i] = records
                .filter(r => {
                    const rd = new Date(r.date);
                    return rd.getMonth() === m && rd.getFullYear() === y;
                })
                .reduce((sum, r) => sum + r.amount, 0);
        }

        const maxVal = Math.max(...monthlyTotals, 1);
        bars.forEach((bar, i) => {
            const pct = (monthlyTotals[i] / maxVal) * 100;
            bar.style.height = `${Math.max(pct, 2)}%`;
            if (labels[i]) labels[i].textContent = monthNames[i];

            // Tooltip or ARIA label
            bar.parentElement.setAttribute('aria-label', `${monthNames[i]}: R${monthlyTotals[i].toFixed(2)}`);
        });
    }

    // ──────────── CSV Export ────────────

    function exportToCSV() {
        const records = window.AppState.records;
        if (records.length === 0) {
            alert('No records to export!');
            return;
        }

        const headers = ['ID', 'Description', 'Amount', 'Category', 'Date', 'CreatedAt', 'UpdatedAt'];
        const csvRows = [headers.join(',')];

        records.forEach(r => {
            const row = [
                r.id,
                `"${r.description.replace(/"/g, '""')}"`, // Escape quotes
                r.amount,
                `"${r.category}"`,
                r.date,
                r.createdAt,
                r.updatedAt
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fintrack_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ──────────── Category Management (Future-proofing) ────────────

    function updateCategoryDropdowns() {
        const records = window.AppState.records;
        const categories = [...new Set(['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other', ...records.map(r => r.category)])];

        const filterSelect = document.getElementById('filter-category');
        if (filterSelect) {
            const currentVal = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            filterSelect.value = currentVal;
        }

        const formSelect = document.getElementById('txn-category');
        if (formSelect) {
            const currentVal = formSelect.value;
            formSelect.innerHTML = '<option value="">-- Select --</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            formSelect.value = currentVal;
        }
    }

    // ──────────── Init ────────────

    function bindEvents() {
        const btnCsv = document.getElementById('btn-export-csv');
        if (btnCsv) btnCsv.addEventListener('click', exportToCSV);

        const filterCat = document.getElementById('filter-category');
        if (filterCat) {
            filterCat.addEventListener('change', () => {
                // Trigger records re-render
                // app.js has an internal renderRecords, we need to make sure it respects this filter
                if (window.FinTrackApp && window.FinTrackApp.renderRecords) {
                    window.FinTrackApp.renderRecords();
                }
            });
        }
    }

    window.FinTrackM6 = {
        init: function () {
            bindEvents();
            renderMonthlyChart();
            updateCategoryDropdowns();
            console.log('✅ Milestone 6 initialized');
        },
        renderDashboard: function () {
            renderMonthlyChart();
        },
        getCategoryFilter: function () {
            const el = document.getElementById('filter-category');
            return el ? el.value : 'all';
        }
    };

})();
