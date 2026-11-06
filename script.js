let allTenders = [];

// North East ke Sabhi States ke Official Districts ki Master List
const STATE_DISTRICTS_MASTER = {
    "Assam": [
        "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
        "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
        "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metro", "Karbi Anglong",
        "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari",
        "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    "Meghalaya": [
        "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills",
        "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills",
        "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
    ],
    "Arunachal Pradesh": [
        "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Itanagar Capital Complex",
        "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley",
        "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi",
        "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
    ],
    "Nagaland": [
        "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon",
        "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyü", "Tuensang", "Wokha", "Zünheboto"
    ],
    "Manipur": [
        "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam",
        "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong",
        "Tengnoupal", "Thoubal", "Ukhrul"
    ],
    "Mizoram": [
        "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai",
        "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"
    ],
    "Tripura": [
        "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
    ],
    "Sikkim": [
        "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"
    ]
};

// State-wise Major Departments Master List (Taaki Assam mein sirf Assam ke departments dikhein)
const STATE_DEPARTMENTS_MASTER = {
    "Assam": [
        "PWD Assam", "Bodoland Territorial Council", "PHE Assam", "Health & Family Welfare Assam",
        "Education Dept Assam", "Irrigation Dept Assam", "Water Resources Assam", "GMDA Assam",
        "APDCL (Assam Power)", "Panchayat & Rural Development Assam"
    ],
    "Meghalaya": ["PHE Meghalaya", "PWD Meghalaya", "MeECL (Power)", "Health Dept Meghalaya"],
    "Arunachal Pradesh": ["Power Department Arunachal", "PWD Arunachal", "PHE & WS Arunachal", "Rural Works Dept"],
    "Nagaland": ["NPWD Nagaland", "PHED Nagaland", "Power Dept Nagaland"],
    "Manipur": ["Health Directorate Manipur", "PWD Manipur", "PHED Manipur"],
    "Mizoram": ["PWD Mizoram", "PHE Mizoram", "Power & Electricity Mizoram"],
    "Tripura": ["Education Dept Tripura", "PWD Tripura", "DWS Tripura"],
    "Sikkim": ["Tourism Dept Sikkim", "Roads & Bridges Sikkim", "Power Dept Sikkim"]
};

async function loadTenders() {
    try {
        const response = await fetch('./tenders.json');
        if (!response.ok) throw new Error('tenders.json not found');
        
        allTenders = await response.json();
        
        // State dropdown bharna
        populateStateDropdown(allTenders);
        
        // Shuru mein saare districts aur departments load karna
        updateDistrictAndDeptDropdowns('ALL');
        
        // Shuru mein saare tenders dikhana
        renderTenders(allTenders);

        // Event Listeners lagana
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

function populateStateDropdown(tenders) {
    const stateSelect = document.getElementById('state-filter');
    if (!stateSelect) return;

    // Master list aur JSON data dono se unique states lena
    const masterStates = Object.keys(STATE_DISTRICTS_MASTER);
    const jsonStates = tenders.map(t => t.state || 'Assam');
    const allStates = [...new Set([...masterStates, ...jsonStates])].sort();

    allStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// State badalne par District aur Department dono ko usi State ke hisaab se update karna
function handleStateChange() {
    const selectedState = document.getElementById('state-filter').value;
    updateDistrictAndDeptDropdowns(selectedState);
    applyFilters();
}

function updateDistrictAndDeptDropdowns(selectedState) {
    const districtSelect = document.getElementById('district-filter');
    const deptSelect = document.getElementById('department-filter');
    if (!districtSelect || !deptSelect) return;

    // 1. District Dropdown Reset & Populate
    districtSelect.innerHTML = '<option value="ALL">All Districts</option>';
    let districtsList = [];

    if (selectedState === 'ALL') {
        // Sabhi states ke districts combine karein
        Object.values(STATE_DISTRICTS_MASTER).forEach(list => districtsList.push(...list));
        allTenders.forEach(t => { if (t.district) districtsList.push(t.district); });
    } else {
        // Sirf selected state ke saare official districts + JSON ke districts
        districtsList = [...(STATE_DISTRICTS_MASTER[selectedState] || [])];
        allTenders
            .filter(t => (t.state || 'Assam') === selectedState)
            .forEach(t => { if (t.district) districtsList.push(t.district); });
    }

    [...new Set(districtsList)].sort().forEach(dist => {
        const option = document.createElement('option');
        option.value = dist;
        option.textContent = dist;
        districtSelect.appendChild(option);
    });

    // 2. Department Dropdown Reset & Populate (Sirf selected state ke departments!)
    deptSelect.innerHTML = '<option value="ALL">All Departments</option>';
    let deptList = [];

    if (selectedState === 'ALL') {
        Object.values(STATE_DEPARTMENTS_MASTER).forEach(list => deptList.push(...list));
        allTenders.forEach(t => { if (t.department) deptList.push(t.department); });
    } else {
        // Sirf chune gaye state ke departments hi dikhayega, doosre states ke nahi!
        deptList = [...(STATE_DEPARTMENTS_MASTER[selectedState] || [])];
        allTenders
            .filter(t => (t.state || 'Assam') === selectedState)
            .forEach(t => { if (t.department) deptList.push(t.department); });
    }

    [...new Set(deptList)].sort().forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });
}

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

function renderTenders(tendersToDisplay) {
    const tenderContainer = document.getElementById('live-tenders-container');
    if (!tenderContainer) return;

    tenderContainer.innerHTML = '';

    if (tendersToDisplay.length === 0) {
        tenderContainer.innerHTML = `
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; padding: 25px; border-radius: 8px; text-align: center; margin-top: 15px;">
                <p style="color: #f8fafc; font-weight: bold; margin-bottom: 6px;">No active tenders currently listed for this specific District/Department filter.</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Select "All Districts" or "All Departments" above to view other live tenders in this State.</p>
            </div>
        `;
        return;
    }

    tendersToDisplay.forEach(tender => {
        const card = document.createElement('div');
        card.className = 'tender-card';
        const winRateClass = tender.winRate === 'High Win Rate' ? 'high-rate' : 'medium-rate';
        const stateLabel = tender.state ? `, ${tender.state}` : '';

        card.innerHTML = `
            <div class="tender-meta">
                <span class="district-badge">📍 ${tender.location || tender.district}${stateLabel}</span>
                <span class="win-probability ${winRateClass}">🎯 ${tender.winRate}</span>
            </div>
            <h3>${tender.title}</h3>
            <div class="tender-value">${tender.estimate}</div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;">
