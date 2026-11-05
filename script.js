// Function to fetch and display live tenders dynamically
async function loadTenders() {
    try {
        // Fetching data from your automated tenders.json file
        const response = await fetch('tenders.json');
        const tenders = await response.json();
        
        const tenderContainer = document.getElementById('live-tenders-container');
        tenderContainer.innerHTML = ''; // Clearing static placeholder loading text

        tenders.forEach(tender => {
            const card = document.createElement('div');
            card.className = 'tender-card';
            
            // Setting dynamic status color based on competition/win-rate
            const winRateClass = tender.winRate === 'High Win Rate' ? 'high-rate' : 'medium-rate';

            card.innerHTML = `
                <div class="location-tag">📍 ${tender.location}</div>
                <div class="win-rate ${winRateClass}">🎯 ${tender.winRate}</div>
                <h3>${tender.title}</h3>
                <p class="estimated-cost">Estimated: <strong>${tender.estimate}</strong></p>
                <p class="meta-info">Department: ${tender.department} | Ref: ${tender.ref}</p>
                <p class="closing-date">⚠️ Closing Date: <strong>${tender.closingDate}</strong></p>
            `;
            tenderContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading tenders:', error);
        document.getElementById('live-tenders-container').innerHTML = 
            '<p class="error-msg">Failed to load live tenders. Please try again later.</p>';
    }
}

// Trigger runner when DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadTenders);
