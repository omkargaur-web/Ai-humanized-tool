// Global variables for Netlify Identity
let currentUser = null;
let currentWordLimit = 300;

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
    const outputWordCount = document.getElementById('outputWordCount');
    const btnText = document.getElementById('btnText');
    const processingText = document.getElementById('processingText');

    // =========================================
    // THEME LOGIC - DARK/LIGHT TOGGLE
    // =========================================
    
    function updateThemeIcon() {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (document.body.classList.contains('light-theme')) {
                icon.className = 'fas fa-moon'; // Light theme mein chand
            } else {
                icon.className = 'fas fa-sun'; // Dark theme mein suraj
            }
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
        updateThemeIcon();
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            }
            updateThemeIcon();
        });
    }

    // =========================================
    // NETLIFY IDENTITY INTEGRATION
    // =========================================
    
    function initNetlifyIdentity() {
        if (window.netlifyIdentity) {
            console.log("Netlify Identity initialized");
            
            window.netlifyIdentity.on('init', (user) => {
                currentUser = user;
                updateUserLimits();
            });
            
            window.netlifyIdentity.on('login', (user) => {
                currentUser = user;
                updateUserLimits();
                window.netlifyIdentity.close();
                showNotification('✅ Login successful! Word limit increased.', 'success');
            });
            
            window.netlifyIdentity.on('logout', () => {
                currentUser = null;
                updateUserLimits();
                showNotification('👋 Logged out successfully.', 'info');
            });
            
            window.netlifyIdentity.on('error', (err) => {
                console.error('Netlify Identity Error:', err);
                showNotification('Login error occurred. Please try again.', 'error');
            });
        } else {
            setTimeout(initNetlifyIdentity, 500);
        }
    }

    function updateUserLimits() {
        if (!wordCount || !inputText) return;
        
        if (currentUser) {
            const roles = currentUser.app_metadata?.roles || [];
            
            if (roles.includes('premium')) {
                currentWordLimit = 2000;
                wordCount.innerHTML = `Words: 0/2000 <span style="color: #a855f7; font-weight: 600;">(Premium)</span>`;
                inputText.style.borderColor = '#a855f7';
            } else {
                currentWordLimit = 500;
                wordCount.innerHTML = `Words: 0/500 <span style="color: #4CAF50; font-weight: 600;">(Logged In)</span>`;
                inputText.style.borderColor = '#4CAF50';
            }
        } else {
            currentWordLimit = 300;
            wordCount.innerHTML = `Words: 0/300`;
            inputText.style.borderColor = '';
        }
        
        if (inputText) updateCounts();
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // =========================================
    // WORD COUNT FUNCTIONS
    // =========================================
    
    function updateCounts() {
        if (!inputText || !wordCount) return;
        
        const text = inputText.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        if (currentUser) {
            const roles = currentUser.app_metadata?.roles || [];
            if (roles.includes('premium')) {
                wordCount.innerHTML = `Words: ${words}/2000 <span style="color: #a855f7; font-weight: 600;">(Premium)</span>`;
            } else {
                wordCount.innerHTML = `Words: ${words}/500 <span style="color: #4CAF50; font-weight: 600;">(Logged In)</span>`;
            }
        } else {
            wordCount.innerHTML = `Words: ${words}/300`;
        }
        
        if (charCount) charCount.textContent = `Chars: ${chars}`;
        
        if (humanizeBtn) {
            if (words === 0) {
                humanizeBtn.disabled = true;
                humanizeBtn.title = "Please enter some text";
                wordCount.style.color = '';
            } else if (words > currentWordLimit) {
                humanizeBtn.disabled = true;
                humanizeBtn.title = `Word limit exceeded (max ${currentWordLimit} words)`;
                wordCount.style.color = '#f44336';
            } else {
                humanizeBtn.disabled = false;
                humanizeBtn.title = "";
                wordCount.style.color = '#4CAF50';
            }
        }
    }

    // =========================================
    // BUTTON ACTIONS - PASTE BUTTON FIXED
    // =========================================
    
    // Paste button - FIXED VERSION
    if (pasteBtn && inputText) {
        pasteBtn.addEventListener('click', async () => {
            try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    inputText.value = text;
                    updateCounts();
                    showNotification('📋 Text pasted successfully!', 'success');
                } else {
                    // Fallback for older browsers
                    inputText.focus();
                    document.execCommand('paste');
                    showNotification('Use Ctrl+V to paste', 'info');
                }
            } catch (err) {
                console.error('Paste error:', err);
                // Agar permission error hai to alternative method
                inputText.focus();
                showNotification('📋 Press Ctrl+V to paste', 'info');
            }
        });
    }

    // Clear button
    if (clearBtn && inputText) {
        clearBtn.addEventListener('click', () => {
            inputText.value = '';
            if (outputText) outputText.value = '';
            updateCounts();
            if (outputWordCount) outputWordCount.textContent = "Words: 0";
            showNotification('🧹 All cleared!', 'info');
        });
    }

    // Copy button
    if (copyBtn && outputText) {
        copyBtn.addEventListener('click', async () => {
            if (!outputText.value.trim()) {
                showNotification('Nothing to copy!', 'warning');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(outputText.value);
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                showNotification('📋 Copied to clipboard!', 'success');
                setTimeout(() => copyBtn.innerHTML = originalHTML, 2000);
            } catch(e) {
                outputText.select();
                document.execCommand('copy');
                showNotification('📋 Copied!', 'success');
            }
        });
    }

    // =========================================
    // API CALL FUNCTION - DEMO MODE REMOVED
    // =========================================
    
    if (humanizeBtn) {
        humanizeBtn.addEventListener('click', async () => {
            const textToConvert = inputText.value.trim();
            
            if (!textToConvert) {
                showNotification('Please enter some text to humanize!', 'warning');
                return;
            }

            const words = textToConvert.split(/\s+/).length;
            if (words > currentWordLimit) {
                showNotification(`Word limit exceeded! Maximum ${currentWordLimit} words allowed.`, 'error');
                return;
            }

            // UI Loading state
            humanizeBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (processingText) processingText.style.display = 'inline';
            outputText.value = "🤖 AI is humanizing your text... Please wait.";

            try {
                // API call to Netlify Function
                const response = await fetch("/.netlify/functions/humanize", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ 
                        text: textToConvert
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.detail || "Server connection failed");
                }

                // Success: Show humanized text
                outputText.value = data.output || "Error: No output received";
                
                // Update output word count
                if (outputWordCount) {
                    const outWords = outputText.value.trim().split(/\s+/).length;
                    outputWordCount.textContent = `Words: ${outWords}`;
                }

                showNotification('✅ Text humanized successfully!', 'success');

            } catch (error) {
                console.error("API Error:", error);
                outputText.value = `Error: ${error.message}. Please try again.`;
                showNotification('❌ API Error: ' + error.message, 'error');
            } finally {
                humanizeBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (processingText) processingText.style.display = 'none';
            }
        });
    }

    // =========================================
    // INPUT EVENT LISTENER
    // =========================================
    
    if (inputText) {
        inputText.addEventListener('input', updateCounts);
    }

    // =========================================
    // INITIALIZATION
    // =========================================
    
    initTheme();
    initNetlifyIdentity();
    
    setTimeout(() => {
        updateCounts();
    }, 100);
});
