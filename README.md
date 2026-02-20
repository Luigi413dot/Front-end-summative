# FinTrack – Student Finance Tracker

FinTrack is a responsive, accessible, vanilla HTML/CSS/JS web application that helps students manage their personal finances. Users can log transactions, view spending statistics, set budget caps, search/filter records, and easily import/export their data.

## Features

- **Transaction Management**: Add, edit, and delete expense records. Includes full data validation to ensure correctness.
- **Dashboard & Analytics**:
  - Live statistical overview (total spent, top category, etc.)
  - Category distribution pie chart
  - 7-day spending trend chart
  - Monthly spending history bar chart
  - Budget cap tracking with progress indicators
- **Advanced Search & Filtering**: 
  - Live Regex search to quickly locate specific transactions.
  - Case-insensitive toggle and highlighted search matches.
  - Categorical filtering of transactions.
- **Settings & Customization**:
  - Currency selection (ZAR, USD, EUR) with manual exchange rate adjustments.
  - Budget cap settings to help you stay on track.
  - Dark / Light mode theme switcher.
- **Data Management**: Persist your entries to `localStorage`. Import or Export your data via JSON and export data as CSV files.
- **Financial Tools**:
  - *Compound Interest Calculator*: Plan for the future and watch your savings grow.
  - *Budget Guessing Game*: Test your spending knowledge.
- **Market Trends**: Check out the latest financial news and cryptocurrency prices.

## Technologies Used

- **HTML5**: Semantic and accessible markup.
- **CSS3 / Vanilla CSS**: Custom properties (variables), Grid, Flexbox, and responsive mobile-first design (No Bootstrap/Tailwind).
- **JavaScript (ES6+)**: Vanilla DOM manipulation, regex matching, local storage interactions, and chart rendering.
- **jQuery** (only used for specific scraping stretch goals).

## How to Run the App

1. Clone or download the repository to your local machine.
2. Navigate to the project folder (`summative/`).
3. Open `index.html` in your favorite modern web browser.

*Note: For some specific features (like the Market News web scraping) to function identically to a production environment without CORS errors, it is recommended to run the app using a local development server (e.g., the **Live Server** extension in VS Code).*

## Testing

FinTrack comes with a custom automated unit test framework built completely in Vanilla JS! 
To run the assertions:
- Open the `tests.html` file in your browser to execute and view the test suite for validation rules, state management, edge cases, and storage logic.

## File Structure

- `index.html`: Main application interface
- `tests.html`: Automated test suite
- `seed.json`: Contains diverse seed records for testing
- `styles/`: Contains modular CSS (`main.css`, `layout.css`, `components.css`)
- `scripts/`: Modular JavaScript files:
  - `app.js`: Application routing and main features
  - `state.js`: Core state and record management
  - `storage.js`: Local storage saving/loading and file export/import
  - `validators.js`: Regex form validation rules and logic
  - `scraping.js`: Web scraping scripts
  - `milestone5.js` / `milestone6.js`: Extended feature implementations

## Accessibility (a11y)

FinTrack was built with accessibility in mind following WCAG principles. It supports:
- Full keyboard navigation and sensible tab orders.
- Native ARIA attributes & live regions for announcements.
- Accessible form validation and error handling.
- Contrast-compliant color palettes in both Light and Dark themes.
- https://youtu.be/GwksmTh4oaI Here is the demo video
