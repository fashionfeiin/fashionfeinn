// ==========================================
// 1. Supabase Client Initialization
// ==========================================
const SUPABASE_URL = 'https://uilzexhyrpzrwhitthow.supabase.co'; // Replace with your Supabase Project URL
const SUPABASE_ANON_KEY = 'sb_publishable_dqsyUaS0Ba58WDCRSNz1dA_MpRUMHT1'; // Replace with your Supabase anon/public key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. Application State & Storage
// ==========================================
let cartCount = 0;
let selectedItem = { name: "Architectural Wool Blazer", price: 180 };
let contactMode = 'phone';
let isSignUpMode = false;
let currentUser = null;

// Check active session on page load
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        updateLoginButton(currentUser.email);
    }
}

function updateLoginButton(email) {
    const loginBtn = document.getElementById('login-open-btn');
    if (loginBtn) {
        loginBtn.textContent = `👤 ${email.split('@')[0]}`;
        loginBtn.onclick = handleLogout; 
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    const loginBtn = document.getElementById('login-open-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Log In';
        loginBtn.onclick = openLoginModal;
    }
    alert('Logged out successfully.');
}

// ==========================================
// 3. Catalog & Product Selection
// ==========================================
function selectProduct(name, price) {
    selectedItem = { name, price };
    
    const selectedItemEl = document.querySelector('#fit-verdict strong');
    if (selectedItemEl) {
        selectedItemEl.textContent = name;
    }

    const studioSection = document.getElementById('studio');
    if (studioSection) {
        studioSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    computeSize();
}

// ==========================================
// 4. Precision Fit Studio & Avatar Visualizer
// ==========================================
function toggleCustomDataMode() {
    const isCustom = document.getElementById('privacy-toggle').checked;
    const customForm = document.getElementById('custom-measurement-form');
    const standardPanel = document.getElementById('standard-sizing-panel');

    if (isCustom) {
        customForm.classList.remove('hidden');
        standardPanel.classList.add('hidden');
        computeSize();
    } else {
        customForm.classList.add('hidden');
        standardPanel.classList.remove('hidden');
    }
}

function updateAvatar() {
    const height = document.getElementById('height-input').value;
    const weight = document.getElementById('weight-input').value;
    const chest = document.getElementById('chest-input').value;
    const waist = document.getElementById('waist-input').value;

    document.getElementById('height-val').textContent = height;
    document.getElementById('weight-val').textContent = weight;
    document.getElementById('chest-val').textContent = chest;
    document.getElementById('waist-val').textContent = waist;

    const torsoScale =
