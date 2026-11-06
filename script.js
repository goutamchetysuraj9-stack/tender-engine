async function loadTenders() {
    try {
        const response = await fetch('./tenders.json');
        if (!response.ok) throw new Error('tenders.json not found');
        
        const tenders = await response.json();
        const tenderContainer = document.getElementById('live-tenders-container');
        
        if (tenderContainer) {
            tenderContainer.innerHTML = ''; 

            tenders.forEach(tender => {
                const card = document.createElement('div');
                card.className = 'tender-card';
                const winRateClass = tender.winRate === 'High Win Rate' ? 'high-rate' : 'medium-rate';

                card.innerHTML = `
                    <div class="tender-meta">
                        <span class="district-badge">📍 ${tender.location}</span>
                        <span class="win-probability ${winRateClass}">🎯 ${tender.winRate}</span>
                    </div>
                    <h3>${tender.title}</h3>
                    <div class="tender-value">${tender.estimate}</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;">
                        Department: ${tender.department} | Ref: ${tender.ref}
                    </p>
                    <div class="adsense-placeholder">[ GOOGLE ADSENSE RESPONSIVE BANNER SLOT ]</div>
                    <p style="font-size: 0.85rem; color: var(--accent-gold);">Closing Date: ${tender.closingDate}</p>
                    
                    <!-- 👇 Tender kholne ke liye clickable button -->
                    <a href="${tender.link || 'https://assamtenders.gov.in'}" target="_blank" 
                       style="display: inline-block; background-color: var(--emerald); color: white; padding: 10px 16px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 12px;">
                       View & Bid on Official Portal →
                    </a>
                `;
                tenderContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading tenders:', error);
        const container = document.getElementById('live-tenders-container');
        if (container) {
            container.innerHTML = '<p style="color: var(--danger-red); padding: 20px;">Failed to load live tenders. Please try again later.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadTenders);
