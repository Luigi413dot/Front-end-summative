/* ============================================================
   FINTRACK – Regex Validation Rules
   4 standard rules + 1 advanced (back-reference)
   ============================================================ */

/** Regex Catalog
 * ──────────────────────────────────────────────────────────
 * 1. Description:  /^\S(.*\S)?$/           – No leading/trailing spaces
 * 2. Amount:       /^(0|[1-9]\d*)(\.\d{1,2})?$/ – Valid currency
 * 3. Date:         /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/ – YYYY-MM-DD
 * 4. Category:     /^[A-Za-z]+(?:[ \-][A-Za-z]+)*$/ – Letters, spaces, hyphens
 * 5. Duplicate:    /\b(\w+)\s+\1\b/i       – Back-reference duplicate words (ADVANCED)
 * ──────────────────────────────────────────────────────────
 */

const VALIDATION_RULES = {
    /* Rule 1 — Description: no leading/trailing whitespace, no collapsed double spaces */
    description: {
        pattern: /^\S+(?:\s\S+)*$/,
        message: 'Description cannot have leading, trailing, or double spaces.',
        fieldId: 'txn-description',
        errorId: 'desc-error'
    },

    /* Rule 2 — Amount: valid currency (0, positive integer or up to 2 decimal places) */
    amount: {
        pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        message: 'Enter a valid amount (e.g., 0, 12, 12.50).',
        fieldId: 'txn-amount',
        errorId: 'amount-error'
    },

    /* Rule 3 — Date: YYYY-MM-DD format */
    date: {
        pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: 'Please enter a valid date (YYYY-MM-DD).',
        fieldId: 'txn-date',
        errorId: 'date-error'
    },

    /* Rule 4 — Category: letters, spaces, hyphens */
    category: {
        pattern: /^[A-Za-z]+(?:[ \-][A-Za-z]+)*$/,
        message: 'Category must contain only letters, spaces, or hyphens.',
        fieldId: 'txn-category',
        errorId: 'category-error'
    }
};

/* Rule 5 (ADVANCED) — Duplicate consecutive words via back-reference */
const DUPLICATE_WORD_REGEX = /\b(\w+)\s+\1\b/i;

/**
 * Validate a single field value against its rule.
 * @param {string} ruleName – key from VALIDATION_RULES
 * @param {string} value – the trimmed input value
 * @returns {{ valid: boolean, message: string }}
 */
function validateField(ruleName, value) {
    const rule = VALIDATION_RULES[ruleName];
    if (!rule) return { valid: true, message: '' };

    // Empty check (required field)
    if (!value || value.length === 0) {
        return { valid: false, message: `${capitalize(ruleName)} is required.` };
    }

    // Regex pattern check
    if (!rule.pattern.test(value)) {
        return { valid: false, message: rule.message };
    }

    return { valid: true, message: '' };
}

/**
 * Check description for duplicate consecutive words (advanced regex).
 * @param {string} text
 * @returns {{ hasDuplicates: boolean, match: string|null }}
 */
function checkDuplicateWords(text) {
    const match = text.match(DUPLICATE_WORD_REGEX);
    return {
        hasDuplicates: !!match,
        match: match ? match[0] : null
    };
}

/**
 * Validate all form fields and return results.
 * @param {object} formData – { description, amount, category, date }
 * @returns {{ isValid: boolean, errors: object, duplicateWarning: string|null }}
 */
function validateForm(formData) {
    const errors = {};
    let isValid = true;

    // Validate each field
    for (const [field, value] of Object.entries(formData)) {
        if (VALIDATION_RULES[field]) {
            const result = validateField(field, value);
            if (!result.valid) {
                errors[field] = result.message;
                isValid = false;
            }
        }
    }

    // Check for duplicate words in description (warning, not blocking)
    let duplicateWarning = null;
    if (formData.description) {
        const dupCheck = checkDuplicateWords(formData.description);
        if (dupCheck.hasDuplicates) {
            duplicateWarning = `Duplicate word detected: "${dupCheck.match}"`;
        }
    }

    return { isValid, errors, duplicateWarning };
}

/**
 * Show validation error on a specific field in the DOM.
 * @param {string} fieldId – the input element ID
 * @param {string} errorId – the error span ID
 * @param {string} message – the error message text
 */
function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);

    if (field) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
        errorEl.textContent = `⚠ ${message}`;
        errorEl.hidden = false;
        errorEl.classList.add('is-visible');
    }
}

/**
 * Clear validation error on a specific field.
 * @param {string} fieldId
 * @param {string} errorId
 */
function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);

    if (field) {
        field.classList.remove('is-invalid');
        field.setAttribute('aria-invalid', 'false');
    }
    if (errorEl) {
        errorEl.hidden = true;
        errorEl.classList.remove('is-visible');
    }
}

/**
 * Clear all form errors.
 */
function clearAllErrors() {
    for (const rule of Object.values(VALIDATION_RULES)) {
        clearFieldError(rule.fieldId, rule.errorId);
    }
    const dupWarning = document.getElementById('duplicate-word-warning');
    if (dupWarning) {
        dupWarning.hidden = true;
        dupWarning.classList.remove('is-visible');
    }
}

/**
 * Apply validation results to the DOM, showing/clearing errors.
 * @param {{ isValid: boolean, errors: object, duplicateWarning: string|null }} result
 */
function applyValidationToDOM(result) {
    // Clear previous errors first
    clearAllErrors();

    // Show errors for invalid fields
    for (const [field, message] of Object.entries(result.errors)) {
        const rule = VALIDATION_RULES[field];
        if (rule) {
            showFieldError(rule.fieldId, rule.errorId, message);
        }
    }

    // Show duplicate word warning
    const dupWarning = document.getElementById('duplicate-word-warning');
    if (dupWarning) {
        if (result.duplicateWarning) {
            dupWarning.textContent = `⚠ ${result.duplicateWarning}`;
            dupWarning.hidden = false;
            dupWarning.classList.add('is-visible');
        } else {
            dupWarning.hidden = true;
            dupWarning.classList.remove('is-visible');
        }
    }
}

/**
 * Safe regex compiler: compile a user-typed regex pattern with try/catch.
 * @param {string} input – the regex pattern string
 * @param {string} flags – regex flags (default 'i')
 * @returns {RegExp|null} – compiled RegExp or null if invalid
 */
function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch {
        return null;
    }
}

/**
 * Highlight regex matches in text using <mark> tags.
 * @param {string} text – the original text
 * @param {RegExp} re – the compiled regex
 * @returns {string} – HTML string with <mark> highlights
 */
function highlight(text, re) {
    if (!re) return text;
    return text.replace(re, (m) => `<mark>${m}</mark>`);
}

/** Capitalize first letter */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export everything for use in other modules
window.FinTrackValidators = {
    VALIDATION_RULES,
    DUPLICATE_WORD_REGEX,
    validateField,
    checkDuplicateWords,
    validateForm,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    applyValidationToDOM,
    compileRegex,
    highlight
};
