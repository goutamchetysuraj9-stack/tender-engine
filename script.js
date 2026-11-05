document.addEventListener("DOMContentLoaded", function() {
    // Aapke dashboard ke original tables/containers ke IDs
    const smallTable = document.getElementById("small-tenders") || document.querySelector(".small-table");
    const mediumTable = document.getElementById("medium-tenders") || document.querySelector(".medium-table");
    const megaTable = document.getElementById("mega-tenders") || document.querySelector(".mega-table");
    const fallbackContainer = document.getElementById("live-tenders-container");

    // Backup Data agar json file se automatic scrape na ho sake
    const fallbackTenders = [
        {
            title: "PWD Road Repair & Upgradation Works",
            district: "Udalguri",
            budget: 25000000,
            dept: "PWD Assam",
            closing: "28-Nov-2026",
            win_probability: "95%"
        },
        {
            title: "Supply of Office & IT Infrastructure Equipment",
            district: "Tangla",
            budget: 1200000,
            dept: "Bodoland Territorial Council",
            closing: "02-Dec-2026",
            win_probability: "80%"
        }
    ];

    function renderTendersToDashboard(tenders) {
        // Purane code ki tarah tables ko pehle clear karna
        if(smallTable) smallTable.innerHTML = '';
        if(mediumTable) mediumTable.innerHTML = '';
        if(megaTable) megaTable.innerHTML = '';
        if(fallbackContainer) fallbackContainer.innerHTML = '';

        tenders.forEach(tender => {
            const districtText = tender.district ? `(${tender.district})` : '';
            const winBadge = tender.win_probability ? `<span class="badge">${tender.win_probability} Win</span>` : '';
            const budgetVal = tender.budget || tender.cost || "Check Document";
            const closingDate = tender.closing || "N/A";
            
            const rowHTML = `
                <div class="tender-card">
                    <h3>${tender.title} ${districtText}</h3>
                    <p class="budget">Budget: ${budgetVal}</p>
                    <p class="dept">Dept: ${tender.dept || 'Govt Portal'}</p>
                    <p class="date">Closing: ${closingDate} ${winBadge}</p>
                </div>
            `;

            // Budget ke hisab se sahi section me render karna jaisa aapka Market System AI karta tha
            if (tender.budget <= 500000 && smallTable) {
                smallTable.insertAdjacentHTML('beforeend', rowHTML);
            } else if (tender.budget > 500000 && tender.budget <= 5000000 && mediumTable) {
                mediumTable.insertAdjacentHTML('beforeend', rowHTML);
            } else if (tender.budget > 5000000 && megaTable) {
                megaTable.insertAdjacentHTML('beforeend', rowHTML);
            } else if (fallbackContainer) {
                fallbackContainer.insertAdjacentHTML('beforeend', rowHTML);
            }
        });
    }

    // Main logic: JSON file se fetch karna
    fetch("tenders.json")
        .then(response => {
            if (!response.ok) throw new Error("JSON Fetch Failed");
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                renderTendersToDashboard(data);
            } else {
                renderTendersToDashboard(fallbackTenders);
            }
        })
        .catch(err => {
            console.log("Using system backup data matrix:", err);
            renderTendersToDashboard(fallbackTenders);
        });
});
