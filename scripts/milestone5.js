/* ============================================================
   FINTRACK – Milestone 5 Features
   Theme Switching, Financial Calculator, and Budget Game
   ============================================================ */

(function () {
    'use strict';

    // ──────────── Theme Switcher ────────────

    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle?.querySelector('.sun-icon');
    const moonIcon = themeToggle?.querySelector('.moon-icon');
    const html = document.documentElement;

    function initTheme() {
        const savedTheme = localStorage.getItem('fintrack-theme') || 'light';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('fintrack-theme', theme);

        if (theme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // ──────────── Compound Interest Calculator ────────────

    const btnCalc = document.getElementById('btn-calc-interest');
    const principalInput = document.getElementById('calc-principal');
    const rateInput = document.getElementById('calc-rate');
    const yearsInput = document.getElementById('calc-years');
    const resultDiv = document.getElementById('calc-result');
    const resultValue = document.getElementById('calc-result-value');

    if (btnCalc) {
        btnCalc.addEventListener('click', () => {
            const p = parseFloat(principalInput.value) || 0;
            const r = parseFloat(rateInput.value) / 100 || 0;
            const t = parseFloat(yearsInput.value) || 0;

            if (p <= 0 || r <= 0 || t <= 0) return;

            // A = P(1 + r/n)^(nt) -> monthly compounding n=12
            const n = 12;
            const amount = p * Math.pow((1 + r / n), (n * t));

            resultValue.textContent = `R${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultDiv.style.display = 'block';
        });
    }

    // ──────────── Budgeting Guessing Game ────────────

    let targetCategory = '';
    let targetAmount = 0;

    const gameIntro = document.getElementById('game-intro');
    const gamePlay = document.getElementById('game-play');
    const gameFeedback = document.getElementById('game-feedback');
    const btnStart = document.getElementById('btn-start-game');
    const btnSubmit = document.getElementById('btn-submit-guess');
    const btnPlayAgain = document.getElementById('btn-play-again');
    const gameQuestion = document.getElementById('game-question');
    const gameGuessInput = document.getElementById('game-guess');
    const gameFeedbackText = document.getElementById('game-feedback-text');

    function startGame() {
        const records = window.AppState.records;
        if (records.length === 0) {
            alert('Add some transactions first to play the game!');
            return;
        }

        const categories = [...new Set(records.map(r => r.category))];
        targetCategory = categories[Math.floor(Math.random() * categories.length)];

        targetAmount = records
            .filter(r => r.category === targetCategory)
            .reduce((sum, r) => sum + r.amount, 0);

        gameQuestion.textContent = `Guess the total amount spent on "${targetCategory}":`;
        gameGuessInput.value = '';

        gameIntro.style.display = 'none';
        gamePlay.style.display = 'block';
        gameFeedback.style.display = 'none';
    }

    function submitGuess() {
        const guess = parseFloat(gameGuessInput.value) || 0;
        const diff = Math.abs(guess - targetAmount);
        const accuracy = targetAmount === 0 ? 0 : (1 - diff / targetAmount) * 100;

        let message = '';
        if (diff === 0) {
            message = `🎯 Perfect! You nailed it! The total was exactly R${targetAmount.toFixed(2)}.`;
        } else if (accuracy > 90) {
            message = `🔥 So close! The actual total was R${targetAmount.toFixed(2)}. Your accuracy: ${accuracy.toFixed(1)}%`;
        } else if (accuracy > 50) {
            message = `👍 Not bad! The actual total was R${targetAmount.toFixed(2)}. Accuracy: ${accuracy.toFixed(1)}%`;
        } else {
            message = `😅 A bit off! The actual total was R${targetAmount.toFixed(2)}. Try tracking your spending more closely!`;
        }

        gameFeedbackText.textContent = message;
        gamePlay.style.display = 'none';
        gameFeedback.style.display = 'block';
    }

    if (btnStart) btnStart.addEventListener('click', startGame);
    if (btnSubmit) btnSubmit.addEventListener('click', submitGuess);
    if (btnPlayAgain) btnPlayAgain.addEventListener('click', startGame);

    // ──────────── Exports ────────────

    window.FinTrackM5 = {
        init: function () {
            initTheme();
        }
    };

})();
