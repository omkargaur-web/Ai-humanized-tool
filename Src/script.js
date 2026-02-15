document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements Selection ---
    const themeToggle = document.getElementById('themeToggle');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const humanizeBtn = document.getElementById('humanizeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const aiPercentage = document.getElementById('aiPercentage');
    const outputWordCount = document.getElementById('outputWordCount');
    const btnText = document.getElementById('btnText');
    const processingText = document.getElementById('processingText');

    // --- Theme Logic ---
    function updateThemeIcon() {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = document.body.classList.contains('light-theme') ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.replace('dark-theme', 'light-theme');
        } else {
            document.body.classList.add('dark-theme');
        }
        updateThemeIcon();
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.replace('dark-theme', 'light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.replace('light-theme', 'dark-theme');
                localStorage.setItem('theme', 'dark');
            }
            updateThemeIcon();
        });
    }

    // --- Analysis Functions ---
    function updateCounts() {
        if (!inputText || !wordCount) return;
        const text = inputText.value;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        
        wordCount.textContent = `Words: ${words.length}/300`;
        if (charCount) charCount.textContent = `Chars: ${text.length}`;
        
        if (humanizeBtn) humanizeBtn.disabled = words.length === 0 || words.length > 300;
        wordCount.style.color = words.length > 300 ? 'red' : '';
    }

    // --- Actions ---
    if (pasteBtn && inputText) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                inputText.value = text;
                updateCounts();
            } catch (err) {
                alert('Browser ne paste allow nahi kiya. Kripya Ctrl+V dabayein.');
            }
        });
    }

    if (clearBtn && inputText) {
        clearBtn.addEventListener('click', () => {
            inputText.value = '';
            outputText.value = '';
            updateCounts();
            if(outputWordCount) outputWordCount.textContent = "Words: 0";
        });
    }

    if (copyBtn && outputText) {
        copyBtn.addEventListener('click', async () => {
            if (!outputText.value.trim()) return;
            try {
                await navigator.clipboard.writeText(outputText.value);
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            } catch(e) {
                outputText.select();
                document.execCommand('copy');
            }
        });
    }

    // --- API Call Section (FIXED) ---
    if (humanizeBtn) {
        humanizeBtn.addEventListener('click', async () => {
            const textToConvert = inputText.value.trim();
            if (!textToConvert) return;

            // UI Loading state
            humanizeBtn.disabled = true;
            btnText.style.display = 'none';
            processingText.style.display = 'inline';
            outputText.value = "AI is humanizing your text... Please wait.";

            try {
                // Backend function ko call karna
                const response = await fetch("/api/humanize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: textToConvert })
                });

                const data = await response.json();

                if (!response.ok) {
                    // Purane hardcoded error message ki jagah ab asli error dikhega
                    throw new Error(data.detail || data.error || "Server connection failed");
                }

                // Success: AI output dikhana
                outputText.value = data.output;
                
                const outWords = data.output.trim().split(/\s+/).filter(w => w.length > 0).length;
                if(outputWordCount) outputWordCount.textContent = `Words: ${outWords}`;

            } catch (error) {
                console.error("Error Details:", error);
                // Agar key missing hai toh server ab ye message bhejega
                outputText.value = `Error: ${error.message}`;
            } finally {
                humanizeBtn.disabled = false;
                btnText.style.display = 'inline';
                processingText.style.display = 'none';
            }
        });
    }

    // --- Initialization ---
    initTheme();
    if (inputText) {
        inputText.addEventListener('input', updateCounts);
    }
});
