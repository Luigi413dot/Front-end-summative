/* ============================================================
   FINTRACK – Storage Module
   localStorage persistence, import/export with validation
   ============================================================ */

const STORAGE_KEY = 'appData';
const SETTINGS_KEY = 'appSettings';

/**
 * Load all transaction records from localStorage.
 * @returns {Array} – array of transaction objects
 */
function loadRecords() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to load records from localStorage:', e);
        return [];
    }
}

/**
 * Save all transaction records to localStorage.
 * @param {Array} data – array of transaction objects
 */
function saveRecords(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save records to localStorage:', e);
    }
}

/**
 * Load settings from localStorage.
 * @returns {object} – settings object
 */
function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : getDefaultSettings();
    } catch (e) {
        console.error('Failed to load settings:', e);
        return getDefaultSettings();
    }
}

/**
 * Save settings to localStorage.
 * @param {object} settings
 */
function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

/**
 * Get default settings.
 * @returns {object}
 */
function getDefaultSettings() {
    return {
        baseCurrency: 'ZAR',
        rates: { USD: 0.055, EUR: 0.051 },
        budgetCap: 0
    };
}

/**
 * Validate imported JSON data structure.
 * @param {*} data – parsed JSON
 * @returns {{ valid: boolean, message: string, data: Array|null }}
 */
function validateImportData(data) {
    if (!Array.isArray(data)) {
        return { valid: false, message: 'JSON must be an array of records.', data: null };
    }

    const requiredFields = ['id', 'description', 'amount', 'category', 'date', 'createdAt', 'updatedAt'];

    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        if (typeof record !== 'object' || record === null) {
            return { valid: false, message: `Record at index ${i} is not a valid object.`, data: null };
        }

        for (const field of requiredFields) {
            if (!(field in record)) {
                return { valid: false, message: `Record at index ${i} is missing required field "${field}".`, data: null };
            }
        }

        if (typeof record.amount !== 'number' || record.amount < 0) {
            return { valid: false, message: `Record at index ${i} has an invalid amount.`, data: null };
        }
    }

    return { valid: true, message: 'Valid data.', data: data };
}

/**
 * Export records as a downloadable JSON file.
 * @param {Array} records
 */
function exportToJSON(records) {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export for global use
window.FinTrackStorage = {
    loadRecords,
    saveRecords,
    loadSettings,
    saveSettings,
    getDefaultSettings,
    validateImportData,
    exportToJSON
};
