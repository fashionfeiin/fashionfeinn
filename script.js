// Initialize Supabase Client
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Replace with your anon/public key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to fetch and display scholarships
async function fetchScholarships() {
    const container = document.getElementById('scholarship-list');
    
    const { data, error } = await supabase
        .from('scholarships')
        .select('*');

    if (error) {
        console.error('Error fetching scholarships:', error);
        container.innerHTML = '<p>Could not load scholarships at this time.</p>';
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<p>No scholarships found.</p>';
        return;
    }

    // Render results to the DOM
    container.innerHTML = data.map(s => `
        <div class="scholarship-card">
            <h3>${s.title}</h3>
            <p><strong>Provider:</strong> ${s.provider}</p>
            <p><strong>Amount:</strong> $${s.amount}</p>
            <p>${s.description}</p>
            <p><small>Deadline: ${s.deadline}</small></p>
        </div>
    `).join('');
}

// Run on page load
fetchScholarships();
