// FF Application State & HCD Logic Module

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
function updateAvatar() {
    if (!isCustomDataAllowed) return;

    // Read Slider Inputs
    const height = parseInt(document.getElementById('height-input').value);
    const weight = parseInt(document.getElementById('weight-input').value);
    const chest = parseInt(document.getElementById('chest-input').value);
    const waist = parseInt(document.getElementById('waist-input').value);

    // Update Value UI Labels
    document.getElementById('height-val').textContent = height;
    document.getElementById('weight-val').textContent = weight;
    document.getElementById('chest-val').textContent = chest;
    document.getElementById('waist-val').textContent = waist;

    // Compute Mannequin Visual Scale
    const scaleY = (height / 175).toFixed(2);
    const chestWidth = Math.round((chest / 96) * 70);
    const waistWidth = Math.round((waist / 80) * 60);

    // Apply Real-time CSS Transformations
    const mannequin = document.getElementById('ai-mannequin');
    const torso = document.getElementById('avatar-torso');
    const waistEl = document.getElementById('avatar-waist');

    if (mannequin && torso && waistEl) {
        mannequin.style.transform = `scaleY(${scaleY})`;
        torso.style.width = `${chestWidth}px`;
        waistEl.style.width = `${waistWidth}px`;
    }

    // Benchmark Latency for HCD Transparency
    const t0 = performance.now();
    const recommendedSize = calculateRecommendedSize(height, weight, chest, waist);
    const t1 = performance.now();

    // Update Size Recommendation Badge
    document.getElementById('recommended-size').textContent = recommendedSize;
    document.getElementById('fit-latency-note').textContent = `⚡ Size computed in ${(t1 - t0).toFixed(2)}ms (Local Zero-Latency Engine)`;
}

// Toggle Custom Data Privacy vs Standard Size Mode
function toggleCustomDataMode() {
    const toggle = document.getElementById('privacy-toggle');
    isCustomDataAllowed = toggle.checked;

    const customForm = document.getElementById('custom-measurement-form');
    const standardPanel = document.getElementById('standard-sizing-panel');

    if (isCustomDataAllowed) {
        customForm.classList.remove('hidden');
        standardPanel.classList.add('hidden');
        updateAvatar();
    } else {
        customForm.classList.add('hidden');
        standardPanel.classList.remove('hidden');
        document.getElementById('recommended-size').textContent = "Standard Select";
        document.getElementById('fit-latency-note').textContent = "🔒 Anonymous Mode Active (No Body Data Stored)";
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
