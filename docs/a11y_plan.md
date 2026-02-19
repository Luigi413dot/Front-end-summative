# Accessibility (a11y) Plan – Student Finance Tracker

## 1. Overview

This document outlines the accessibility strategy for FinTrack, ensuring the app is usable by all users, including those relying on assistive technologies, keyboard-only navigation, and screen readers.

---

## 2. Semantic HTML Structure

### 2.1 Landmarks

Every page will use proper semantic landmarks:

```html
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation links -->
    </nav>
  </header>
  <main id="main-content" role="main">
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
      <!-- Content -->
    </section>
  </main>
  <footer role="contentinfo">
    <!-- Footer content -->
  </footer>
</body>
```

### 2.2 Heading Hierarchy

- **`<h1>`**: One per page — the app name or current section title
- **`<h2>`**: Section headings (Dashboard, Records, Add Transaction, etc.)
- **`<h3>`**: Sub-sections within each area
- Never skip heading levels (e.g., no jumping from `<h1>` to `<h3>`)

---

## 3. Keyboard Navigation

### 3.1 Tab Order

All interactive elements will follow a logical tab order:

| Order | Element                     | Key          |
|-------|-----------------------------|--------------|
| 1     | Skip-to-content link        | Tab          |
| 2     | Navigation links            | Tab          |
| 3     | Search input                | Tab          |
| 4     | Sort controls               | Tab          |
| 5     | Table rows / Card actions   | Tab          |
| 6     | Form fields (in order)      | Tab          |
| 7     | Submit / Cancel buttons     | Tab          |

### 3.2 Keyboard Interactions

| Action                  | Key(s)               | Behaviour                          |
|-------------------------|----------------------|------------------------------------|
| Navigate between links  | Tab / Shift+Tab      | Move forward / backward            |
| Activate link/button    | Enter / Space        | Triggers click event               |
| Close modal/dialog      | Escape               | Close and return focus to trigger   |
| Navigate sort options   | Arrow keys           | Cycle through sort directions       |
| Delete confirmation     | Enter = confirm, Escape = cancel | Prevent accidental deletion |

### 3.3 Focus Management

- **Visible focus indicators**: All focusable elements will have a clearly visible focus outline (minimum 2px solid, high-contrast colour)
- **Focus trapping**: When a modal/dialog opens, focus is trapped inside until dismissed
- **Focus restoration**: When a modal closes, focus returns to the element that triggered it
- **No focus loss**: After adding/editing/deleting a record, focus moves to a logical next element

```css
/* Focus style example */
:focus-visible {
  outline: 3px solid #4A90D9;
  outline-offset: 2px;
}
```

---

## 4. ARIA Attributes

### 4.1 Live Regions

| Element              | ARIA Attribute            | Value        | Purpose                                    |
|----------------------|---------------------------|--------------|--------------------------------------------|
| Budget status        | `aria-live`               | `polite`     | Announces remaining budget when under cap  |
| Budget exceeded      | `aria-live`               | `assertive`  | Urgently announces when budget is exceeded |
| Form error messages  | `role`                    | `alert`      | Announces validation errors immediately    |
| Search results count | `aria-live`               | `polite`     | Announces number of matching records       |
| Status messages      | `role`                    | `status`     | Announces save/delete confirmations        |

### 4.2 Form Accessibility

```html
<!-- Every input has a visible label -->
<label for="txn-description">Description</label>
<input 
  type="text" 
  id="txn-description" 
  name="description"
  aria-describedby="desc-error"
  aria-invalid="false"
  required
/>
<span id="desc-error" role="alert" class="error-message" hidden>
  Description cannot have leading/trailing spaces.
</span>
```

- All `<input>` elements have associated `<label>` elements via `for`/`id`
- Error messages are linked via `aria-describedby`
- Invalid state indicated via `aria-invalid="true"`
- Required fields marked with `aria-required="true"` and `required` attribute

### 4.3 Table Accessibility

```html
<table role="table" aria-label="Transaction Records">
  <caption class="sr-only">List of all financial transactions</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="none">Description</th>
      <th scope="col" aria-sort="descending">Date</th>
      <th scope="col" aria-sort="none">Amount</th>
      <th scope="col">Category</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <!-- rows -->
  </tbody>
</table>
```

---

## 5. Colour & Contrast

### 5.1 Minimum Requirements

- **Normal text**: Contrast ratio ≥ 4.5:1 (WCAG AA)
- **Large text** (≥ 18px or ≥ 14px bold): Contrast ratio ≥ 3:1
- **Interactive elements**: Contrast ratio ≥ 3:1 against adjacent colours
- **Focus indicators**: Contrast ratio ≥ 3:1

### 5.2 Design Tokens

| Token                  | Light Mode | Dark Mode  | Purpose              |
|------------------------|------------|------------|----------------------|
| `--color-text`         | `#1a1a2e`  | `#e0e0e0`  | Primary text         |
| `--color-bg`           | `#ffffff`  | `#121212`  | Page background      |
| `--color-primary`      | `#2563eb`  | `#60a5fa`  | Interactive elements |
| `--color-error`        | `#dc2626`  | `#f87171`  | Error states         |
| `--color-success`      | `#16a34a`  | `#4ade80`  | Success states       |
| `--color-border`       | `#d1d5db`  | `#374151`  | Borders              |

### 5.3 Non-Colour Indicators

- Errors: Red colour **+** error icon **+** descriptive text
- Success: Green colour **+** checkmark icon **+** descriptive text
- Never rely on colour alone to convey information

---

## 6. Screen Reader Considerations

- **Skip-to-content link**: First focusable element on every page
- **Page title**: Updated dynamically when changing sections (e.g., `document.title = 'Records | FinTrack'`)
- **Meaningful link text**: No "click here"; use descriptive labels (e.g., "Edit transaction: Lunch at cafeteria")
- **Icon buttons**: All icon-only buttons have `aria-label` attributes
- **Decorative images**: Use `aria-hidden="true"` or empty `alt=""`
- **Loading states**: Announce via `aria-live` region

---

## 7. Responsive a11y

- **Touch targets**: Minimum 44×44px on mobile (WCAG 2.5.5)
- **Zoom**: App must be usable at 200% zoom without horizontal scrolling
- **Text scaling**: All text uses relative units (`rem`, `em`) not `px`
- **Orientation**: Supports both portrait and landscape

---

## 8. Testing Strategy

### 8.1 Automated

- Run aXe or Lighthouse accessibility audit
- Validate HTML with W3C validator

### 8.2 Manual

- **Keyboard-only testing**: Navigate entire app without a mouse
- **Screen reader testing**: Test with NVDA or VoiceOver
- **Zoom testing**: Test at 200% and 400% zoom
- **Colour contrast**: Verify with browser DevTools contrast checker

### 8.3 Checklist

- [ ] All images have appropriate `alt` text
- [ ] All form inputs have labels
- [ ] All interactive elements are keyboard accessible
- [ ] Skip-to-content link works
- [ ] ARIA live regions announce dynamic content
- [ ] Focus is managed correctly after state changes
- [ ] Heading hierarchy is logical
- [ ] Colour is never the sole indicator of meaning
- [ ] Touch targets are ≥ 44×44px on mobile
- [ ] Page works at 200% zoom

---

## 9. Keyboard Map

| Key Combination   | Action                              | Context         |
|--------------------|-------------------------------------|-----------------|
| Tab                | Move to next focusable element      | Global          |
| Shift + Tab        | Move to previous focusable element  | Global          |
| Enter              | Activate button/link                | Global          |
| Space              | Toggle checkbox, activate button    | Global          |
| Escape             | Close modal/dialog                  | Modal           |
| Arrow Up/Down      | Navigate sort options / dropdown    | Sort / Select   |
| Ctrl + S           | Save current form (prevented default)| Form           |
| Delete / Backspace | Trigger delete confirmation         | Selected record |

---
