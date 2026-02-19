# Student Finance Tracker – Milestone 1: Spec & Wireframes

## 1. Chosen Theme

**Theme 1 – Student Finance Tracker**  
Track budgets, transactions, and search through spending records.

---

## 2. Purpose & Scope

FinTrack is a responsive, accessible, vanilla HTML/CSS/JS web application that helps students manage their personal finances. Users can log transactions, view spending statistics, set budget caps, search/filter records with regex, and import/export data as JSON — all persisted in `localStorage`.

---

## 3. Pages / Sections

| # | Page / Section   | Description                                                                 |
|---|------------------|-----------------------------------------------------------------------------|
| 1 | **About**        | App purpose, developer contact (GitHub link, email).                        |
| 2 | **Dashboard**    | Stats overview: total records, total spent, top category, 7-day trend chart, budget cap/target with ARIA live regions. |
| 3 | **Records Table**| Sortable, searchable table of all transactions (cards on mobile ≤ 768px).    |
| 4 | **Add/Edit Form**| Form to create or edit a transaction with regex validation and clear errors. |
| 5 | **Settings**     | Currency selection (ZAR + 2 others), manual exchange rates, budget cap.      |

---

## 4. Data Model

### 4.1 Transaction Record Schema

```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T10:30:00.000Z",
  "updatedAt": "2025-09-25T10:30:00.000Z"
}
```

### 4.2 Field Definitions

| Field         | Type     | Constraints                                                     |
|---------------|----------|-----------------------------------------------------------------|
| `id`          | string   | Unique, auto-generated (format: `txn_XXXX`)                    |
| `description` | string   | Required, no leading/trailing spaces, no collapsed doubles      |
| `amount`      | number   | Required, ≥ 0, up to 2 decimal places                          |
| `category`    | string   | Required, one of the default categories or user-defined         |
| `date`        | string   | Required, format YYYY-MM-DD, valid calendar date                |
| `createdAt`   | string   | ISO 8601 timestamp, set on creation                             |
| `updatedAt`   | string   | ISO 8601 timestamp, updated on every edit                       |

### 4.3 Default Categories

- Food  
- Books  
- Transport  
- Entertainment  
- Fees  
- Other  

### 4.4 Persistence

- All records are auto-saved to `localStorage` under the key `appData`.
- Data is stored as a JSON array of transaction objects.
- Import/Export: validate JSON structure before loading.

---

## 5. Regex Validation Rules (minimum 4 + 1 advanced)

| # | Field         | Rule                                         | Regex Pattern                                           | Description                                              |
|---|---------------|----------------------------------------------|---------------------------------------------------------|----------------------------------------------------------|
| 1 | Description   | No leading/trailing spaces; no double spaces | `/^\S(?:.*\S)?$/`                                       | Must start and end with non-whitespace                   |
| 2 | Amount        | Valid currency amount                        | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/`                         | Zero or positive number, up to 2 decimal places          |
| 3 | Date          | Valid YYYY-MM-DD format                      | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/`    | Validates date format structure                          |
| 4 | Category      | Letters, spaces, hyphens only                | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`                       | Allows multi-word categories with spaces or hyphens      |
| 5 | **Advanced**: Duplicate word detection | Back-reference | `/\b(\w+)\s+\1\b/`                    | Catches duplicate words in description (e.g., "the the") |

---

## 6. Search Features

- **Live regex search**: User types a pattern in the search bar; compiled using `try/catch` to handle invalid regex gracefully.
- **Case-insensitive toggle**: Checkbox to toggle `i` flag.
- **Highlight matches**: Use `<mark>` elements to highlight matching text without breaking accessibility.
- **Example patterns**:
  - Cents present: `/\.\d{2}\b/`
  - Beverage keyword: `/(coffee|tea)/i`
  - Duplicate word: `/\b(\w+)\s+\1\b/`

---

## 7. Sorting

Records can be sorted by:
- **Date** (ascending / descending)
- **Description** (A↕Z)
- **Amount** (numeric ↑↓)

---

## 8. Stats Dashboard

| Metric                | Calculation                                  |
|-----------------------|----------------------------------------------|
| Total Records         | Count of all transactions                    |
| Total Spent           | Sum of all `amount` values                   |
| Top Category          | Category with the highest total spending     |
| Last 7 Days Trend     | Simple bar chart (CSS/JS) grouping by day    |
| Budget Cap/Target     | User-set cap; ARIA live region shows remaining/overage (polite when under, assertive when exceeded) |

---

## 9. Settings

- **Base currency**: ZAR (South African Rand)
- **Additional currencies**: USD, EUR (manual exchange rates, no API)
- **Budget cap**: Numeric input for monthly spending target
- All settings persisted in `localStorage`.

---

## 10. File Structure

```
summative/
├── index.html              # Single-page app shell
├── styles/
│   ├── main.css            # Base styles, CSS custom properties
│   ├── layout.css          # Flexbox/Grid responsive layout
│   └── components.css      # Component-specific styles
├── scripts/
│   ├── app.js              # Main entry point, router
│   ├── storage.js          # localStorage load/save, import/export
│   ├── state.js            # Application state management
│   ├── ui.js               # DOM manipulation, rendering
│   ├── validators.js       # Regex validation rules
│   └── search.js           # Regex search, highlight
├── assets/                 # Icons, images
├── docs/
│   ├── M1_spec.md          # This document
│   ├── wireframes.html     # Interactive wireframe sketches
│   └── a11y_plan.md        # Accessibility plan
├── tests.html              # Test assertions
└── seed.json               # ≥10 diverse seed records
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width     | Layout                                       |
|------------|-----------|----------------------------------------------|
| Mobile     | ≤ 360px   | Single column, card-based records, stacked nav |
| Tablet     | ≤ 768px   | Two-column where appropriate, side nav or tabs |
| Desktop    | ≥ 1024px  | Full table view, sidebar dashboard, spacious  |

All layouts are **mobile-first** — base styles target the smallest viewport, then media queries enhance for larger screens.

---

## 12. Technology Constraints

- **No frameworks**: No React, Vue, Angular, Bootstrap, Tailwind, etc.
- **Vanilla only**: HTML5, CSS3, ES6+ JavaScript (ES modules or IIFE)
- **jQuery**: Only allowed for optional stretch scraping page

---
