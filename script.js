document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("live-tenders-container");

    // Pehle se chal rahe fields ke sath aapka data setup
    const fallbackTenders = [
        {
            title: "PWD Road Repair & Upgradation Works",
            district: "Udalguri",
            tag: "High Win Rate",
            class: "high-win",
            cost: "₹25,000,000 (2.5 Crore)",
            dept: "PWD Assam | Ref: Tender-UDG-2026-09",
            closing: "28-Nov-2026"
        },
        {
            title: "Supply of Office & IT Infrastructure Equipment",
            district: "Tangla",
            tag: "Medium Competition",
            class: "med-comp",
            cost: "₹1,200,000 (12 Lakhs)",
            dept: "Bodoland Territorial Council",
            closing: "02-Dec-2026"
        }
    ];

    function renderTenders(tendersList) {
        if (!container) return;
        container.innerHTML = "";
        
        tendersList.forEach(tender => {
            const card = document.createElement("div");
            // Agar aapke variable ka naam thoda badla bhi ho, toh yeh || lagakar use handle kar lega taaki undefined na aaye
            const dist = tender.district || tender.dist || "Assam";
            const currentTag = tender.tag || "Live";
            const estCost = tender.cost || tender.amount || "Check Document";
            const department = tender.dept || tender.department || "Govt Portal";
            const lastDate = tender.closing || tender.date || "N/A";
            
            card.className = `tender-card ${tender.class || ''}`;
            card.innerHTML = `
                <span class="location-tag">📍 ${dist}</span>
                <span class="meta-tag">🎯 ${currentTag}</span>
                <h3>${tender.title || 'Open Tender'}</h3>
                <div class="est-cost">${estCost}</div>
                <div class="dept-info">Department: ${department}</div>
                <div class="closing-date">Closing Date: ${lastDate}</div>
            `;
            container.appendChild(card);
        });
    }

    // JSON file load karne ka backup route
    fetch("tenders.json")
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                renderTenders(data);
            } else {
                renderTenders(fallbackTenders);
            }
        })
        .catch(() => {
            renderTenders(fallbackTenders);
        });
});
