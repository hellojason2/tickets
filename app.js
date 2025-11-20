// Translations
const translations = {
    en: {
        title: "Name Mixer",
        subtitle: "Mix passenger names intelligently",
        realPassenger: "Real Passenger",
        nameToMix: "Name to Mix With (ecredit)",
        firstName: "First Name",
        lastName: "Last Name",
        placeholderLeft: "Enter passenger details...\n\nExample:\nFirst Name: John\nLast Name: Doe",
        placeholderRight: "Enter name to mix with...\n\nExample:\nFirst Name: Kelly\nLast Name: Connor",
        mixButton: "Mix Names",
        aiAssistant: "🤖 AI Assistant",
        resultIntro: "Here's your mixed name result:",
        loading: "Mixing names with AI...",
        errorBothFields: "Please fill in both chat boxes with name information",
        errorLeftName: "Please provide both first and last name for the Real Passenger",
        errorRightName: "Please provide both first and last name for the Name to Mix With",
        errorGeneric: "An error occurred while mixing names. Please try again."
    },
    vi: {
        title: "Trộn Tên",
        subtitle: "Trộn tên hành khách một cách thông minh",
        realPassenger: "Hành Khách Thực",
        nameToMix: "Tên Để Trộn (ecredit)",
        firstName: "Tên",
        lastName: "Họ",
        placeholderLeft: "Nhập thông tin hành khách...\n\nVí dụ:\nTên: John\nHọ: Nguyen",
        placeholderRight: "Nhập tên để trộn...\n\nVí dụ:\nTên: Kelly\nHọ: Tran",
        mixButton: "Trộn Tên",
        aiAssistant: "🤖 Trợ Lý AI",
        resultIntro: "Đây là kết quả tên đã trộn:",
        loading: "Đang trộn tên với AI...",
        errorBothFields: "Vui lòng điền đầy đủ cả hai ô với thông tin tên",
        errorLeftName: "Vui lòng cung cấp cả tên và họ cho Hành Khách Thực",
        errorRightName: "Vui lòng cung cấp cả tên và họ cho Tên Để Trộn",
        errorGeneric: "Đã xảy ra lỗi khi trộn tên. Vui lòng thử lại."
    }
};

// Get current language from localStorage or default to English
let currentLang = localStorage.getItem('language') || 'en';

// Get DOM elements
const leftInput = document.getElementById('leftInput');
const rightInput = document.getElementById('rightInput');
const mixButton = document.getElementById('mixButton');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultFirstName = document.getElementById('resultFirstName');
const resultLastName = document.getElementById('resultLastName');
const errorMessage = document.getElementById('errorMessage');
const timestamp = document.getElementById('timestamp');
const langEnBtn = document.getElementById('langEn');
const langViBtn = document.getElementById('langVi');

// API endpoint - automatically detect if running locally or on Railway
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api/mix-names'
    : '/api/mix-names';

// Initialize language
function initLanguage() {
    updateLanguage(currentLang);
    updateActiveLanguageButton();
}

// Update language
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update placeholder texts
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    updateActiveLanguageButton();
}

// Update active language button
function updateActiveLanguageButton() {
    langEnBtn.classList.toggle('active', currentLang === 'en');
    langViBtn.classList.toggle('active', currentLang === 'vi');
}

// Language button event listeners
langEnBtn.addEventListener('click', () => updateLanguage('en'));
langViBtn.addEventListener('click', () => updateLanguage('vi'));

// Event listener for the mix button
mixButton.addEventListener('click', handleMixNames);

// Allow Ctrl/Cmd + Enter to submit
[leftInput, rightInput].forEach(textarea => {
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleMixNames();
        }
    });
});

/**
 * Parse name information from textarea input
 * Supports formats:
 * - "First Name: John\nLast Name: Doe"
 * - "John\nDoe"
 * - "John Doe"
 */
function parseNameInput(text) {
    const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    let firstName = '';
    let lastName = '';
    
    // Try to find labeled format first (supports both English and Vietnamese)
    for (const line of lines) {
        const firstNameMatch = line.match(/(?:first\s*name|fn|tên)\s*[:=]\s*(.+)/i);
        const lastNameMatch = line.match(/(?:last\s*name|ln|họ)\s*[:=]\s*(.+)/i);
        
        if (firstNameMatch) {
            firstName = firstNameMatch[1].trim();
        }
        if (lastNameMatch) {
            lastName = lastNameMatch[1].trim();
        }
    }
    
    // If no labeled format found, try simple format
    if (!firstName && !lastName) {
        // Check if it's a single line with space (e.g., "John Doe")
        if (lines.length === 1 && lines[0].includes(' ')) {
            const parts = lines[0].split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }
        // Check if it's two separate lines
        else if (lines.length >= 2) {
            firstName = lines[0];
            lastName = lines[1];
        }
        // Single line, no space - assume it's just first name
        else if (lines.length === 1) {
            firstName = lines[0];
        }
    }
    
    return { firstName, lastName };
}

async function handleMixNames() {
    // Get input values
    const leftText = leftInput.value.trim();
    const rightText = rightInput.value.trim();

    // Validate that both inputs have content
    if (!leftText || !rightText) {
        showError(translations[currentLang].errorBothFields);
        return;
    }

    // Parse the inputs
    const leftName = parseNameInput(leftText);
    const rightName = parseNameInput(rightText);

    // Validate parsed names
    if (!leftName.firstName || !leftName.lastName) {
        showError(translations[currentLang].errorLeftName);
        return;
    }
    if (!rightName.firstName || !rightName.lastName) {
        showError(translations[currentLang].errorRightName);
        return;
    }

    // Hide previous results/errors
    hideResults();
    hideError();
    
    // Show loading indicator
    showLoading();
    
    // Disable button
    mixButton.disabled = true;

    try {
        // Get API key from localStorage
        const apiKey = localStorage.getItem('grokApiKey');
        
        // Call the API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                leftFirstName: leftName.firstName,
                leftLastName: leftName.lastName,
                rightFirstName: rightName.firstName,
                rightLastName: rightName.lastName,
                apiKey: apiKey  // Send API key with the request
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || translations[currentLang].errorGeneric);
        }

        // Display results with timestamp
        resultFirstName.textContent = data.mixedFirstName;
        resultLastName.textContent = data.mixedLastName;
        timestamp.textContent = new Date().toLocaleTimeString();
        showResults();

    } catch (error) {
        console.error('Error mixing names:', error);
        showError(error.message || translations[currentLang].errorGeneric);
    } finally {
        // Hide loading and enable button
        hideLoading();
        mixButton.disabled = false;
    }
}

function showResults() {
    resultsSection.classList.remove('hidden');
    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function hideError() {
    errorSection.classList.add('hidden');
}

function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Cookie utility functions
function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Save textarea values to cookies
function saveTextareaValues() {
    setCookie('leftInput', leftInput.value);
    setCookie('rightInput', rightInput.value);
}

// Load textarea values from cookies
function loadTextareaValues() {
    const savedLeft = getCookie('leftInput');
    const savedRight = getCookie('rightInput');
    
    if (savedLeft) {
        leftInput.value = savedLeft;
    }
    if (savedRight) {
        rightInput.value = savedRight;
    }
}

// Save textarea values whenever they change
leftInput.addEventListener('input', saveTextareaValues);
rightInput.addEventListener('input', saveTextareaValues);

// Initialize language on page load
initLanguage();

// Load saved textarea values on page load
loadTextareaValues();

// Calculator Functionality
const calcInput = document.getElementById('calcInput');
const result70 = document.getElementById('result70');
const result80 = document.getElementById('result80');

function updateCalculator() {
    const inputValue = parseFloat(calcInput.value) || 0;
    
    // Calculate 70% and 80%
    const seventyPercent = (inputValue * 0.70).toFixed(2);
    const eightyPercent = (inputValue * 0.80).toFixed(2);
    
    // Update display
    result70.textContent = seventyPercent;
    result80.textContent = eightyPercent;
}

// Add event listener for real-time calculation
calcInput.addEventListener('input', updateCalculator);

// Initialize calculator display
updateCalculator();

// Settings Modal Functionality
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const passwordStep = document.getElementById('passwordStep');
const apiKeyStep = document.getElementById('apiKeyStep');
const passwordInput = document.getElementById('passwordInput');
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
const passwordError = document.getElementById('passwordError');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const apiKeySuccess = document.getElementById('apiKeySuccess');

const DEFAULT_PASSWORD = '1111';

// Open settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    passwordStep.classList.remove('hidden');
    apiKeyStep.classList.add('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    apiKeySuccess.classList.add('hidden');
});

// Close modal
closeModal.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Verify password
verifyPasswordBtn.addEventListener('click', () => {
    if (passwordInput.value === DEFAULT_PASSWORD) {
        passwordError.classList.add('hidden');
        passwordStep.classList.add('hidden');
        apiKeyStep.classList.remove('hidden');
        
        // Load existing API key if available
        const savedApiKey = localStorage.getItem('grokApiKey');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
    } else {
        passwordError.classList.remove('hidden');
    }
});

// Allow Enter key to verify password
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyPasswordBtn.click();
    }
});

// Save API key
saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('grokApiKey', apiKey);
        apiKeySuccess.classList.remove('hidden');
        setTimeout(() => {
            apiKeySuccess.classList.add('hidden');
        }, 3000);
    }
});

// Allow Enter key to save API key
apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveApiKeyBtn.click();
    }
});
