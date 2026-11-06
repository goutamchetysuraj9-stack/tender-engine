import json
import re
from datetime import datetime
from playwright.sync_api import sync_playwright

ASSAM_DISTRICTS = [
    "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
    "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metro", "Kamrup", "Karbi Anglong",
    "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari",
    "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"
]

CITY_TO_DISTRICT = {
    "guwahati": "Kamrup Metro",
    "dispur": "Kamrup Metro",
    "tangla": "Udalguri",
    "tezpur": "Sonitpur",
    "silchar": "Cachar",
    "diphu": "Karbi Anglong",
    "haflong": "Dima Hasao",
    "mangaldoi": "Darrang",
    "north lakhimpur": "Lakhimpur"
}

def detect_district(text):
    lower_text = text.lower()
    for city, dist in CITY_TO_DISTRICT.items():
        if city in lower_text:
            return dist
    for dist in ASSAM_DISTRICTS:
        if dist.lower() in lower_text:
            return dist
    return "Kamrup Metro"

def detect_department(text):
    lower_text = text.lower()
    if "pwd" in lower_text or "road" in lower_text or "bridge" in lower_text:
        return "PWD Assam"
    elif "phe" in lower_text or "water" in lower_text or "jal jeevan" in lower_text:
        return "PHE Assam"
    elif "btc" in lower_text or "bodoland" in lower_text:
        return "Bodoland Territorial Council"
    elif "health" in lower_text or "nhm" in lower_text or "hospital" in lower_text:
        return "Health & Family Welfare Assam"
    elif "education" in lower_text or "school" in lower_text:
        return "Education Dept Assam"
    elif "apdcl" in lower_text or "power" in lower_text or "solar" in lower_text:
        return "APDCL (Assam Power)"
    elif "irrigation" in lower_text:
        return "Irrigation Dept Assam"
    return "Panchayat & Rural Development Assam"

def scrape_assam_tenders():
    live_tenders = []
    print("assamtenders.gov.in से लाइव टेंडर निकाले जा रहे हैं...")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.goto("https://assamtenders.gov.in", timeout=60000)
            page.wait_for_timeout(4000)

            rows = page.locator("table tr").all()
            seen_titles = set()

            for row in rows:
                cols = [c.inner_text().strip() for c in row.locator("td").all()]
                if len(cols) >= 3 and len(cols) > 20 and "tender" not in cols.lower()[:10]:
                    title = re.sub(r'\s+', ' ', cols)
                    if title in seen_titles:
                        continue
                    seen_titles.add(title)

                    ref_no = cols if len(cols) > 1 and cols else f"ASM-{datetime.now().strftime('%Y%m')}-{len(live_tenders)+1}"
                    closing_date = cols if len(cols) > 2 and cols else "Check Official Portal"
                    district = detect_district(title)
                    dept = detect_department(title)

                    live_tenders.append({
                        "state": "Assam",
                        "district": district,
                        "location": f"{district}, Assam",
                        "winRate": "Live Portal Tender",
                        "title": title[:140],
                        "estimate": "View BoQ on Official Portal",
                        "department": dept,
                        "ref": ref_no[:40],
                        "closingDate": closing_date[:25],
                        "link": "https://assamtenders.gov.in"
                    })

                    if len(live_tenders) >= 35:
                        break

            browser.close()
    except Exception as e:
        print(f"Live crawl warning: {e}")

    other_ne_tenders = [
        {"state": "Meghalaya", "district": "East Khasi Hills", "location": "Shillong, East Khasi Hills", "winRate": "Active Portal", "title": "State Public Works & Water Supply Tenders (Meghalaya)", "estimate": "Check Official Portal", "department": "PHE Meghalaya", "ref": "MEG-LIVE-PORTAL", "closingDate": "Open", "link": "https://meghalayatenders.gov.in"},
        {"state": "Arunachal Pradesh", "district": "Itanagar Capital Complex", "location": "Itanagar, Arunachal Pradesh", "winRate": "Active Portal", "title": "Power, Roads & Infrastructure Tenders (Arunachal)", "estimate": "Check Official Portal", "department": "Power Department Arunachal", "ref": "ARP-LIVE-PORTAL", "closingDate": "Open", "link": "https://arunachaltenders.gov.in"},
        {"state": "Nagaland", "district": "Kohima", "location": "Kohima, Nagaland", "winRate": "Active Portal", "title": "NPWD & Rural Connectivity Tenders (Nagaland)", "estimate": "Check Official Portal", "department": "NPWD Nagaland", "ref": "NGL-LIVE-PORTAL", "closingDate": "Open", "link": "https://nagalandtenders.gov.in"},
        {"state": "Manipur", "district": "Imphal West", "location": "Imphal, Manipur", "winRate": "Active Portal", "title": "Health, PWD & PHED Procurement Tenders (Manipur)", "estimate": "Check Official Portal", "department": "Health Directorate Manipur", "ref": "MNP-LIVE-PORTAL", "closingDate": "Open", "link": "https://manipurtenders.gov.in"},
        {"state": "Mizoram", "district": "Aizawl", "location": "Aizawl, Mizoram", "winRate": "Active Portal", "title": "PWD & Community Infrastructure Tenders (Mizoram)", "estimate": "Check Official Portal", "department": "PWD Mizoram", "ref": "MIZ-LIVE-PORTAL", "closingDate": "Open", "link": "https://mizoramtenders.gov.in"},
        {"state": "Tripura", "district": "West Tripura", "location": "Agartala, West Tripura", "winRate": "Active Portal", "title": "Education & Public Works Tenders (Tripura)", "estimate": "Check Official Portal", "department": "Education Dept Tripura", "ref": "TRP-LIVE-PORTAL", "closingDate": "Open", "link": "https://tripuratenders.gov.in"},
        {"state": "Sikkim", "district": "Gangtok", "location": "Gangtok, Sikkim", "winRate": "Active Portal", "title": "Tourism, Roads & Bridges Tenders (Sikkim)", "estimate": "Check Official Portal", "department": "Tourism Dept Sikkim", "ref": "SKM-TRM-2026-07", "closingDate": "Open", "link": "https://sikkimtender.gov.in"}
    ]

    final_output = live_tenders + other_ne_tenders

    with open("tenders.json", "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)

    print(f"कुल {len(final_output)} टेंडर tenders.json में सेव हो गए हैं।")

if __name__ == "__main__":
    scrape_assam_tenders()
