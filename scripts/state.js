/* ============================================================
   FINTRACK – Application State Manager
   Centralised state for records and settings
   ============================================================ */

const AppState = {
    records: [],
    settings: null,
    editingId: null,    // ID of record being edited, or null

    /**
     * Initialise state from localStorage.
     */
    init() {
        this.records = window.FinTrackStorage.loadRecords();
        this.settings = window.FinTrackStorage.loadSettings();
    },

    /**
     * Add a new transaction record.
     * @param {object} data – { description, amount, category, date }
     * @returns {object} – the created record
     */
    addRecord(data) {
        const now = new Date().toISOString();
        const record = {
            id: `txn_${Date.now()}`,
            description: data.description.trim(),
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            createdAt: now,
            updatedAt: now
        };
        this.records.push(record);
        this._persist();
        return record;
    },

    /**
     * Update an existing record by ID.
     * @param {string} id
     * @param {object} data – partial update data
     * @returns {object|null} – updated record or null if not found
     */
    updateRecord(id, data) {
        const index = this.records.findIndex(r => r.id === id);
        if (index === -1) return null;

        this.records[index] = {
            ...this.records[index],
            description: data.description.trim(),
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            updatedAt: new Date().toISOString()
        };
        this._persist();
        return this.records[index];
    },

    /**
     * Delete a record by ID.
     * @param {string} id
     * @returns {boolean} – true if deleted
     */
    deleteRecord(id) {
        const index = this.records.findIndex(r => r.id === id);
        if (index === -1) return false;
        this.records.splice(index, 1);
        this._persist();
        return true;
    },

    /**
     * Get a record by ID.
     * @param {string} id
     * @returns {object|null}
     */
    getRecord(id) {
        return this.records.find(r => r.id === id) || null;
    },

    /**
     * Get all records, optionally sorted.
     * @param {string} sortKey – e.g. 'date-desc', 'amount-asc'
     * @returns {Array}
     */
    getRecords(sortKey = 'date-desc') {
        const sorted = [...this.records];
        const [field, direction] = sortKey.split('-');
        const dir = direction === 'asc' ? 1 : -1;

        sorted.sort((a, b) => {
            let valA, valB;
            switch (field) {
                case 'date':
                    valA = a.date;
                    valB = b.date;
                    return valA < valB ? -dir : valA > valB ? dir : 0;
                case 'amount':
                    return (a.amount - b.amount) * dir;
                case 'description':
                    valA = a.description.toLowerCase();
                    valB = b.description.toLowerCase();
                    return valA < valB ? -dir : valA > valB ? dir : 0;
                default:
                    return 0;
            }
        });
        return sorted;
    },

    /**
     * Update settings and persist.
     * @param {object} newSettings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        window.FinTrackStorage.saveSettings(this.settings);
    },

    /**
     * Replace all records (used for import).
     * @param {Array} records
     */
    replaceRecords(records) {
        this.records = records;
        this._persist();
    },

    /**
     * Persist current records to localStorage.
     */
    _persist() {
        window.FinTrackStorage.saveRecords(this.records);
    }
};

window.AppState = AppState;
