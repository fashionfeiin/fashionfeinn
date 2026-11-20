// ==========================================
// 1. SUPABASE CONFIGURATION & INITIALIZATION
// ==========================================
const SUPABASE_URL = 'https://uilzexhyrpzrwhitthow.supabase.co';  
const SUPABASE_ANON_KEY = 'sb_publishable_dqsyUaS0Ba58WDCRSNz1dA_MpRUMHT1';    
const supabaseClient = (window.supabase && SUPABASE_URL !== 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co') 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)  
    : null;

// ==========================================
// 2. DOM INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMeasurementListeners();
    loadUserProfileData(); 
});

function initNavigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideDrawer = document.getElementById('sideDrawer');
    const navOverlay = document.getElementById('navOverlay');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const openProfileBtn = document.getElementById('openProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.getElementById('closeProfileBtn');

    function openDrawer() {
        sideDrawer?.classList.add('open');
        navOverlay?.classList.add('active');
    }

    function closeDrawer() {
        sideDrawer?.classList.remove('open');
        navOverlay?.classList.remove('active');
    }

    hamburgerBtn?.addEventListener('click', openDrawer);
    closeDrawerBtn?.addEventListener('click', closeDrawer);
    navOverlay?.addEventListener('click', closeDrawer);

    openProfileBtn?.addEventListener('click', async () => {
        closeDrawer();
        await loadUserProfileData();
        profileModal?.classList.add('active');
    });

    closeProfileBtn?.addEventListener('click', () => {
        profileModal?.classList.remove('active');
    });

    profileModal?.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            profileModal?.classList.remove('active');
        }
    });
}

// Attach real-time listeners to sliders if present on page
function initMeasurementListeners() {
    const inputIds = ['height-input', 'weight-input', 'chest-input', 'waist-input', 'hips-input', 'inseam-input'];
    
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAvatar);
        }
    });
}

// ==========================================
// 3. INTERACTIVE MANNEQUIN SCALING & SIZING
// ==========================================
function updateAvatar() {
    const height = parseFloat(document.getElementById('height-input')?.value || 175);
    const weight = parseFloat(document.getElementById('weight-input')?.value || 70);
    const chest = parseFloat(document.getElementById('chest-input')?.value || 96);
    const waist = parseFloat(document.getElementById('waist-input')?.value || 80);
    const hips = parseFloat(document.getElementById('hips-input')?.value || 98);
    const inseam = parseFloat(document.getElementById('inseam-input')?.value || 81);

    setVal('height-val', height);
    setVal('weight-val', weight);
    setVal('chest-val', chest);
    setVal('waist-val', waist);
    setVal('hips-val', hips);
    setVal('inseam-val', inseam);

    const torso = document.getElementById('avatar-torso');
    const waistPart = document.getElementById('avatar-waist');
    const hipsPart = document.getElementById('avatar-hips');

    if (torso && waistPart) {
        const heightScale = height / 175;
        const chestScale = chest / 96;
        const waistScale = waist / 80;
        const hipsScale = hips / 98;

        torso.style.transform = `scaleY(${heightScale}) scaleX(${chestScale})`;
        waistPart.style.transform = `scaleX(${waistScale})`;
        if (hipsPart) hipsPart.style.transform = `scaleX(${hipsScale})`;
    }

    const recommendedSize = computeRecommendedSize(chest, waist, hips);
    const recSizeEl = document.getElementById('recommended-size');
    if (recSizeEl) recSizeEl.textContent = recommendedSize;

    const activeItem = document.getElementById('activeItemTitle')?.textContent || 'Architectural Wool Blazer';
    saveSizeRecommendationToProfile(height, weight, chest, waist, hips, inseam, recommendedSize, activeItem);
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function computeRecommendedSize(chest, waist, hips) {
    let size = 'M';
    if (chest < 90 && waist < 75) size = 'S';
    else if (chest >= 102 || waist >= 90 || hips >= 106) size = 'L';
    if (chest >= 110 || waist >= 100) size = 'XL';
    return size;
}

// ==========================================
// 4. LOAD & SAVE PROFILE DATA
// ==========================================
async function loadUserProfileData() {
    let userName = 'Guest';
    let userIdentifier = null;

    try {
        if (supabaseClient) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                userIdentifier = user.email || user.phone;
                userName = user.user_metadata?.full_name || userIdentifier.split('@')[0];
            }
        }
    } catch (err) {
        console.log('Supabase session check skipped:', err);
    }

    if (!userIdentifier) {
        const localSession = JSON.parse(localStorage.getItem('auraUserSession') || 'null');
        if (localSession && localSession.user) {
            userIdentifier = localSession.user;
            userName = localSession.name || userIdentifier.split('@')[0];
        }
    }

    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    const welcomeHeader = document.getElementById('profileWelcomeHeader');
    const emailSubtext = document.getElementById('profileEmailSubtext');
    if (welcomeHeader) welcomeHeader.textContent = `Welcome, ${formattedName}`;
    if (emailSubtext) {
        emailSubtext.textContent = userIdentifier 
            ? `Signed in as ${userIdentifier}` 
            : 'Sign in to sync your sizing history across devices.';
    }

    let savedData = JSON.parse(localStorage.getItem('ff_saved_sizing') || 'null');

    if (supabaseClient && userIdentifier) {
        try {
            const { data, error } = await supabaseClient
                .from('user_profiles')
                .select('*')
                .eq('identifier', userIdentifier)
                .single();

            if (data && !error) {
                savedData = {
                    recommended_size: data.recommended_size || 'M',
                    height: data.height || 175,
                    weight: data.weight || 70,
                    chest: data.chest || 96,
                    waist: data.waist || 80,
                    hips: data.hips || 98,
                    inseam: data.inseam || 81,
                    last_item: data.last_item || 'Architectural Wool Blazer'
                };
            }
        } catch (err) {
            console.log('Profile fetch fallback to local storage:', err);
        }
    }

    if (savedData) {
        setVal('savedSizeDisplay', savedData.recommended_size);
        setVal('savedHeightDisplay', `${savedData.height || 175} cm`);
        setVal('savedWeightDisplay', `${savedData.weight || 70} kg`);
        setVal('savedChestDisplay', `${savedData.chest || 96} cm`);
        setVal('savedWaistDisplay', `${savedData.waist || 80} cm`);
        setVal('savedHipsDisplay', `${savedData.hips || 98} cm`);
        setVal('savedInseamDisplay', `${savedData.inseam || 81} cm`);
        
        const historyEl = document.getElementById('savedHistoryList');
        if (historyEl) {
            historyEl.innerHTML = `<p><strong>Last Fitted Item:</strong> ${savedData.last_item || 'Custom Look'} — Size <strong>${savedData.recommended_size}</strong></p>`;
        }
    }
}

async function saveSizeRecommendationToProfile(height, weight, chest, waist, hips, inseam, recommendedSize, itemName) {
    const sizingRecord = { height, weight, chest, waist, hips, inseam, recommended_size: recommendedSize, last_item: itemName };
    localStorage.setItem('ff_saved_sizing', JSON.stringify(sizingRecord));

    if (supabaseClient) {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            const localSession = JSON.parse(localStorage.getItem('auraUserSession') || 'null');
            const identifier = user?.email || localSession?.user;

            if (identifier) {
                await supabaseClient
                    .from('user_profiles')
                    .upsert({
                        identifier: identifier,
                        height: height,
                        weight: weight,
                        chest: chest,
                        waist: waist,
                        hips: hips,
                        inseam: inseam,
                        recommended_size: recommendedSize,
                        last_item: itemName,
                        updated_at: new Date()
                    }, { onConflict: 'identifier' });
            }
        } catch (err) {
            console.log('Supabase sync skipped:', err);
        }
    }
}

// Sign Out Handler
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch(e){}
    }
    localStorage.removeItem('auraUserSession');
    document.getElementById('profileModal')?.classList.remove('active');
    window.location.reload();
});
