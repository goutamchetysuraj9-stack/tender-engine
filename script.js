let allTenders = []; // Saare tenders ko memory mein rakhne ke liye

async function loadTenders() {
    try {
        const response = await fetch('./tenders.json');
        if (!response.ok) throw new Error('tenders.json not found');
        
        allTenders = await response.json();
        
        // Dropdowns mein automatic State aur Department bharna
        populateFilters(allTenders);
        
        // Shuru mein saare tenders dikhana
        renderTenders(allTenders);

        // Filter change hone par list update karna
        document.getElementById('state-filter')?.addEventListener('change', handleStateChange);
        document.getElementById('district-filter')?.addEventListener('change', applyFilters);
        document.getElementById('department-filter')?.addEventListener('change', applyFilters);

    } catch (error) {
        console.error('Error loading tenders:', error);
        const container = document.getElementById('live-tenders-container');
        if (container) {
            container.innerHTML = '<p style="color: var(--danger-red); padding: 20px;">Failed to load live tenders. Please try again later.</p>';
        }
    }
}

// 1. State aur Department dropdowns ko dynamic tareeke se bharna
function populateFilters(tenders) {
    const stateSelect = document.getElementById('state-filter');
    const deptSelect = document.getElementById('department-filter');
    if (!stateSelect || !deptSelect) return;

    // Unique States nikalna (agar JSON mein state nahi hai toh default 'Assam' maanega)
    const states = [...new Set(tenders.map(t => t.state || 'Assam'))].sort();
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // Unique Departments nikalna
    const departments = [...new Set(tenders.map(t => t.department).filter(Boolean))].sort();
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });

    // Shuru mein saare districts load karna
    updateDistrictDropdown('ALL');
}

// 2. State badalne par sirf usi State ke Districts dikhana
function handleStateChange() {
    const selectedState = document.getElementById('state-filter').value;
    updateDistrictDropdown(selectedState);
    applyFilters();
}

function updateDistrictDropdown(selectedState) {
    const districtSelect = document.getElementById('district-filter');
    if (!districtSelect) return;

    districtSelect.innerHTML = '<option value="ALL">All Districts</option>';

    const filteredByState = selectedState === 'ALL' 
        ? allTenders 
        : allTenders.filter(t => (t.state || 'Assam') === selectedState);

    // District ya location field se unique districts nikalna
    const districts = [...new Set(filteredByState.map(t => t.district || t.location).filter(Boolean))].sort();
    
    districts.forEach(dist => {
        const option = document.createElement('option');
        option.value = dist;
        option.textContent = dist;
        districtSelect.appendChild(option);
    });
}

// 3. Teeno filters (State + District + Department) ko ek saath check karna
function applyFilters() {
    const selectedState = document.getElementById('state-filter')?.value || 'ALL';
    const selectedDistrict = document.getElementById('district-filter')?.value || 'ALL';
    const selectedDept = document.getElementById('department-filter')?.value || 'ALL';

    const filteredTenders = allTenders.filter(tender => {
        const tState = tender.state || 'Assam';
        const tDistrict = tender.district || tender.location;
        const tDept = tender.department;

        const matchState = (selectedState === 'ALL') || (tState === selectedState);
        const matchDistrict = (selectedDistrict === 'ALL') || (tDistrict === selectedDistrict);
        const matchDept = (selectedDept === 'ALL') || (tDept === selectedDept);

        return matchState && matchDistrict && matchDept;
    });

    renderTenders(filteredTenders);
}

// 4. Filtered Tenders ko screen par dikhana
function renderTenders(tendersToDisplay) {
    const tenderContainer = document.getElementById('live-tenders-container');
    if (!tenderContainer) return;

    tenderContainer.innerHTML = '';

    if (tendersToDisplay.length === 0) {
        tenderContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-muted);">No active tenders found for the selected State/District/Department.</p>';
        return;
    }

    tendersToDisplay.forEach(tender => {
        const card = document.createElement('div');
        card.className = 'tender-card';
        const winRateClass = tender.winRate === 'High Win Rate' ? 'high-rate' : 'medium-rate';
        const stateLabel = tender.state ? `, ${tender.state}` : '';

        card.innerHTML = `
            <div class="tender-meta">
                <span class="district-badge">📍 ${tender.district || tender.location}${stateLabel}</span>
                <span class="win-probability ${winRateClass}">🎯 ${tender.winRate}</span>
            </div>
            <h3>${tender.title}</h3>
            <div class="tender-value">${tender.estimate}</div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;">
                Department: ${tender.department} | Ref: ${tender.ref}
            </p>
            <div class="adsense-placeholder">[ GOOGLE ADSENSE RESPONSIVE BANNER SLOT ]</div>
            <p style="font-size: 0.85rem; color: var(--accent-gold);">Closing Date: ${tender.closingDate}</p>
            
            <a href="${tender.link || 'https://assamtenders.gov.in'}" target="_blank" 
               style="display: inline-block; background-color: var(--emerald); color: white; padding: 10px 16px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 12px;">
               View & Bid on Official Portal →
            </a>
        `;
        tenderContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadTenders);
