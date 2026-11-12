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
}

// Application State
const appState = {
    currentUser: null,
    authMethod: 'email', // 'email' or 'phone'
    smsOptIn: true,
    useCustomData: true,
    measurements: {
        height: 170, // cm
        weight: 65,  // kg
        bodyType: 'balanced'
    },
    selectedGarment: null
};

// ==========================================
// 2. DOM EVENT LISTENERS & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    initMannequinSliders();
    initCollectionGrid();
    checkExistingSession();
});

// ==========================================
// 3. AUTHENTICATION & SUPABASE LOGIC
// ==========================================
function initAuthTabs() {
    const emailTab = document.getElementById('emailTab');
    const phoneTab = document.getElementById('phoneTab');
    const emailGroup = document.getElementById('emailGroup');
    const phoneGroup = document.getElementById('phoneGroup');

    if (emailTab && phoneTab) {
        emailTab.addEventListener('click', () => {
            appState.authMethod = 'email';
            emailTab.classList.add('active');
            phoneTab.classList.remove('active');
            emailGroup.style.display = 'block';
            phoneGroup.style.display = 'none';
        });

        phoneTab.addEventListener('click', () => {
            appState.authMethod = 'phone';
            phoneTab.classList.add('active');
            emailTab.classList.remove('active');
            phoneGroup.style.display = 'block';
            emailGroup.style.display = 'none';
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleUserLogin);
    }
}

async function handleUserLogin(e) {
    e.preventDefault();
    const statusEl = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    const password = document.getElementById('passwordInput').value;
    const smsOptInCheckbox = document.getElementById('smsOptIn');
    appState.smsOptIn = smsOptInCheckbox ? smsOptInCheckbox.checked : true;

    const identifier = appState.authMethod === 'email'
        ? document.getElementById('emailInput').value.trim()
        : document.getElementById('phoneInput').value.trim();

    if (!identifier || password.length < 6) {
        showStatus(statusEl, 'Please provide valid credentials (password min 6 chars).', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Connecting to Supabase...';

    try {
        if (supabaseClient) {
            // Real Supabase Authentication / Database Interaction
            if (appState.authMethod === 'email') {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: identifier,
                    password: password
                });
                if (error) throw error;
                appState.currentUser = data.user;
            } else {
                // Phone authentication flow using Supabase OTP / custom handling
                const { data, error } = await supabaseClient.auth.signInWithOtp({
                    phone: identifier
                });
                if (error) throw error;
                appState.currentUser = { phone: identifier };
            }

            // Save user profile & SMS preferences to Supabase table 'user_profiles'
            await saveUserDataToSupabase(identifier);
        } else {
            // Fallback Local Simulation if Supabase credentials aren't configured yet
            await simulateLocalLogin(identifier);
        }

        showStatus(statusEl, `Successfully signed in as ${identifier}! Sizing profile active.`, 'success');
        setTimeout(() => {
            closeAuthModal();
        }, 1200);

    } catch (err) {
        console.error('Auth error:', err);
        showStatus(statusEl, err.message || 'Authentication failed. Check Supabase keys.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

async function saveUserDataToSupabase(identifier) {
    if (!supabaseClient) return;
    
    const profileData = {
        identifier: identifier,
        auth_method: appState.authMethod,
        sms_opt_in: appState.smsOptIn,
        height: appState.measurements.height,
        weight: appState.measurements.weight,
        updated_at: new Date()
    };

    const { error } = await supabaseClient
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'identifier' });

    if (error) {
        console.error('Error saving profile to Supabase:', error);
    }
}

async function simulateLocalLogin(identifier) {
    return new Promise((resolve) => {
        setTimeout(() => {
            appState.currentUser = { identifier, method: appState.authMethod };
            localStorage.setItem('aura_session', JSON.stringify(appState.currentUser));
            resolve();
        }, 600);
    });
}

function checkExistingSession() {
    const saved = localStorage.getItem('aura_session');
    if (saved) {
        appState.currentUser = JSON.parse(saved);
    }
}

// ==========================================
// 4. INTERACTIVE MANNEQUIN & SIZING ENGINE
// ==========================================
function initMannequinSliders() {
    const heightSlider = document.getElementById('heightSlider');
    const weightSlider = document.getElementById('weightSlider');
    const toggleDataCheckbox = document.getElementById('toggleDataCheckbox');

    if (heightSlider) {
        heightSlider.addEventListener('input', (e) => {
            appState.measurements.height = parseFloat(e.target.value);
            document.getElementById('heightVal').textContent = `${appState.measurements.height} cm`;
            updateMannequinDimensions();
        });
    }

    if (weightSlider) {
        weightSlider.addEventListener('input', (e) => {
            appState.measurements.weight = parseFloat(e.target.value);
            document.getElementById('weightVal').textContent = `${appState.measurements.weight} kg`;
            updateMannequinDimensions();
        });
    }

    if (toggleDataCheckbox) {
        toggleDataCheckbox.addEventListener('change', (e) => {
            appState.useCustomData = e.target.checked;
            const controlsArea = document.getElementById('measurementControls');
            if (controlsArea) {
                controlsArea.style.opacity = appState.useCustomData ? '1' : '0.4';
                controlsArea.style.pointerEvents = appState.useCustomData ? 'auto' : 'none';
            }
            updateMannequinDimensions();
        });
    }
}

function updateMannequinDimensions() {
    const mannequinAvatar = document.getElementById('mannequinAvatar');
    if (!mannequinAvatar) return;

    if (!appState.useCustomData) {
        // Standard sizing reset
        mannequinAvatar.style.transform = 'scale(1, 1)';
        document.getElementById('recommendedSize').textContent = 'Standard M';
        return;
    }

    // Compute dynamic scaling based on height and weight inputs
    const baseHeight = 170;
    const baseWeight = 65;

    const heightScale = appState.measurements.height / baseHeight;
    const weightScale = appState.measurements.weight / baseWeight;

    // Apply smooth CSS transform to visual mannequin container
    mannequinAvatar.style.transform = `scale(${weightScale}, ${heightScale})`;

    // Compute AI recommended size
    let recSize = 'M';
    const bmiFactor = appState.measurements.weight / Math.pow(appState.measurements.height / 100, 2);
    if (bmiFactor < 20) recSize = 'S';
    else if (bmiFactor > 25) recSize = 'L';
    if (appState.measurements.height > 185) recSize += ' (Tall)';

    const recEl = document.getElementById('recommendedSize');
    if (recEl) recEl.textContent = recSize;
}

// ==========================================
// 5. COLLECTION & PRODUCT FIT SELECTOR
// ==========================================
function initCollectionGrid() {
    // Example interactive triggers for clothing selection
    const garmentCards = document.querySelectorAll('.garment-card');
    garmentCards.forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedGarment = card.dataset.garmentId;
            garmentCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// Utility UI helpers
function showStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `status-message status-${type}`;
    element.style.display = 'block';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}
