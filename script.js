document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("live-tenders-container");

    // Default Fallback Data agar tenders.json load na ho ya khali ho
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
        container.innerHTML = "";
        tendersList.forEach(tender => {
            const card = document.createElement("div");
            card.className = `tender-card ${tender.class === 'high-win' ? 'high-win' : ''}`;
            
            card.innerHTML = `
                <span class="location-tag">📍 ${tender.district}</span>
                <span class="meta-tag">🎯 ${tender.tag}</span>
                <h3>${tender.title}</h3>
                <div class="est-cost">${tender.cost}</div>
                <div class="dept-info">Department: ${tender.dept}</div>
                <div class="closing-date">Closing Date: ${tender.closing}</div>
            `;
            container.appendChild(card);
        });
    }

    // Tenders.json se data fetch karne ki koshish karein
    fetch("tenders.json")
        .then(response => {
            if (!response.ok) throw new Error("JSON load failure");
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                renderTenders(data);
            } else {
                renderTenders(fallbackTenders);
            }
        })
        .catch(error => {
            console.log("Using backup matrix system data due to:", error);
            renderTenders(fallbackTenders);
        });
});
