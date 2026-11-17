/**
 * FF Fashion Sizing & Mannequin Engine with Supabase Integration
 */


// ==========================================
// 1. SUPABASE CONFIGURATION & INITIALIZATION
// ==========================================
// Replace these placeholders with your actual Supabase project URL and anon/public key
const SUPABASE_URL = 'sb_publishable_dqsyUaS0Ba58WDCRSNz1dA_MpRUMHT1';  
const SUPABASE_ANON_KEY = 'sb_publishable_dqsyUaS0Ba58WDCRSNz1dA_MpRUMHT1';       


let supabaseClient = null;

// Initialize Supabase if SDK is loaded
if (window.supabase && SUPABASE_URL !== 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let selectedProduct = "Architectural Wool Blazer";
let currentContactMode = "phone"; // 'phone' or 'email'
let isCustomDataAllowed = true;
let cartCount = 0;

// Dynamic Sizing Engine Math
function calculateRecommendedSize(height, weight, chest, waist) {
    // Sizing score heuristic for zero-latency local calculation
    const score = (height * 0.2) + (weight * 0.4) + (chest * 0.25) + (waist * 0.15);
    
    if (score < 65) return "XS";
    if (score >= 65 && score < 75) return "S";
    if (score >= 75 && score < 87) return "M";
    if (score >= 87 && score < 98) return "L";
    if (score >= 98 && score < 110) return "XL";
    return "XXL";
}

// Visual Avatar Dynamic Renderer
document.addEventListener('DOMContentLoaded', () => {
    initMeasurementListeners();
});

function initMeasurementListeners() {
    const heightInput = document.getElementById('height-input');
    const weightInput = document.getElementById('weight-input');
    const chestInput = document.getElementById('chest-input');
    const waistInput = document.getElementById('waist-input');

    // Attach real-time event listeners to all sliders
    if (heightInput) heightInput.addEventListener('input', updateAvatar);
    if (weightInput) weightInput.addEventListener('input', updateAvatar);
    if (chestInput) chestInput.addEventListener('input', updateAvatar);
    if (waistInput) waistInput.addEventListener('input', updateAvatar);
}

function updateAvatar() {
    // 1. Get current values from all inputs
    const height = parseFloat(document.getElementById('height-input')?.value || 175);
    const weight = parseFloat(document.getElementById('weight-input')?.value || 70);
    const chest = parseFloat(document.getElementById('chest-input')?.value || 96);
    const waist = parseFloat(document.getElementById('waist-input')?.value || 80);

    // 2. Update numerical text labels on the UI
    const heightValEl = document.getElementById('height-val');
    const weightValEl = document.getElementById('weight-val');
    const chestValEl = document.getElementById('chest-val');
    const waistValEl = document.getElementById('waist-val');

    if (heightValEl) heightValEl.textContent = height;
    if (weightValEl) weightValEl.textContent = weight;
    if (chestValEl) chestValEl.textContent = chest;
    if (waistValEl) waistValEl.textContent = waist;

    // 3. Dynamically scale the AI Mannequin parts in real-time
    const torso = document.getElementById('avatar-torso');
    const waistPart = document.getElementById('avatar-waist');

    if (torso && waistPart) {
        // Calculate scaling factors based on baseline standards (175cm / 70kg / 96cm chest / 80cm waist)
        const heightScale = height / 175;
        const chestScale = chest / 96;
        const waistScale = waist / 80;

        // Apply smooth CSS transforms instantly
        torso.style.transform = `scaleY(${heightScale}) scaleX(${chestScale})`;
        waistPart.style.transform = `scaleX(${waistScale})`;
    }

    // 4. Update recommended clothing size dynamically
    updateRecommendedSize(height, weight, chest);
}

function updateRecommendedSize(height, weight, chest) {
    let size = 'M';
    
    if (chest < 90 && weight < 60) {
        size = 'S';
    } else if (chest > 105 || weight > 90) {
        size = 'L';
    }
    if (height > 185) {
        size += ' (Tall)';
    }

    const recSizeEl = document.getElementById('recommended-size');
    if (recSizeEl) {
        recSizeEl.textContent = size;
    }
}

// Select Product Handler
function selectProduct(name, price) {
    selectedProduct = name;
    const verdictLabel = document.querySelector('#fit-verdict span strong');
    if (verdictLabel) {
        verdictLabel.textContent = name;
    }
    // Smooth Scroll to Studio
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
}

// Select Standard Size Fallback
function selectStandardSize(size) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === size) btn.classList.add('active');
    });
    document.getElementById('recommended-size').textContent = size;
}

// Switch VIP Registration Contact Input Mode
function switchContactMode(mode) {
    currentContactMode = mode;
    const input = document.getElementById('contact-input');
    const btnPhone = document.getElementById('tab-phone');
    const btnEmail = document.getElementById('tab-email');

    if (mode === 'phone') {
        btnPhone.classList.add('active');
        btnEmail.classList.remove('active');
        input.type = 'tel';
        input.placeholder = 'Enter mobile phone (+1...)';
    } else {
        btnEmail.classList.add('active');
        btnPhone.classList.remove('active');
        input.type = 'email';
        input.placeholder = 'Enter your Gmail address';
    }
}

// VIP Signup Handler with Data Sanitization & Security Simulation
function handleSignup(e) {
    e.preventDefault();
    const inputVal = document.getElementById('contact-input').value.trim();
    const feedback = document.getElementById('form-feedback');

    if (!inputVal) {
        feedback.style.color = '#EF4444';
        feedback.textContent = 'Please provide a valid contact method.';
        return;
    }

    // Input Validation Logic
    if (currentContactMode === 'phone' && !/^\+?[0-9\s\-()]{7,15}$/.test(inputVal)) {
        feedback.style.color = '#EF4444';
        feedback.textContent = 'Please enter a valid phone number with country code.';
        return;
    }

    if (currentContactMode === 'email' && !/\S+@\S+\.\S+/.test(inputVal)) {
        feedback.style.color = '#EF4444';
        feedback.textContent = 'Please enter a valid email address.';
        return;
    }

    // Success response
    feedback.style.color = '#10B981';
    feedback.textContent = `✓ Successfully subscribed! VIP sizing alerts will be sent to ${inputVal}.`;
    document.getElementById('contact-input').value = '';
}

// Add to Cart Interaction
function addToCart() {
    cartCount++;
    document.getElementById('cart-count').textContent = cartCount;
    alert(`Added ${selectedProduct} (${document.getElementById('recommended-size').textContent}) to your cart!`);
}

// Initialize Visualizer on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    updateAvatar();
});


