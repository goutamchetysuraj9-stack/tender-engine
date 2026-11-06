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
    "panbazar": "Kamrup Metro",
    "tangla": "Udalguri",
    "tezpur": "Sonitpur",
    "silchar": "Cachar",
    "diphu": "Karbi Anglong",
    "haflong": "Dima Hasao",
    "mangaldoi": "Darrang",
    "dhakuakhana": "Lakhimpur",
    "north lakhimpur": "Lakhimpur",
    "dinjan": "Dibrugarh"
}

# फालतू वेबसाइट मेनू और फ़ुटर शब्दों की लिस्ट जिन्हें हमें छोड़ना है
JUNK_KEYWORDS = [
    "screen reader", "active tenders", "new spp portal", "mis reports",
    "welcome to eprocurement", "online bidder", "help for contractors",
    "visitor no", "designed, developed", "corrigendum title", "all rights reserved"
]

def detect_district(text):
    lower_text = text.lower()
    for city, dist in CITY_TO_DISTRICT.items():
        if city in lower_text:
            return dist
    for dist in ASSAM_DISTRICTS:
        if dist.lower() in lower_text:
            return dist
    return "Kamrup Metro"

def detect_department(text, ref_no):
    combined = (text + " " + ref_no).lower()
    if "gmda" in combined:
        return "GMDA Assam"
    elif "pwd" in combined or "road" in combined or "bridge" in combined:
        return "PWD Assam"
    elif "phe" in combined or "water" in combined or "jal jeevan" in combined:
        return "PHE Assam"
    elif "btc" in combined or "bodoland" in combined:
        return "Bodoland Territorial Council"
    elif "health" in combined or "nhm" in combined or "hospital" in combined or "medical" in combined or "ahidms" in combined:
        return "Health & Family Welfare Assam"
    elif "education" in combined or "school" in combined or "university" in combined:
        return "Education Dept Assam"
    elif "apdcl" in combined or "power" in combined or "solar" in combined:
        return "APDCL (Assam Power)"
    elif "irrigation" in combined or "flood" in combined or "river" in combined:
        return "Water Resources Assam"
    return "Panchayat & Rural Development Assam"

def scrape_assam_tenders():
    live_tenders = []
    print("assamtenders.gov.in से साफ लाइव टेंडर निकाले जा रहे हैं...")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                ignore_https_errors=True,
                java_script_enabled=True,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.goto("https://assamtenders.gov.in", timeout=60000, wait_until="networkidle")
            page.wait_for_timeout(3000)

            rows = page.locator("table tr").all()
            seen_titles = set()

            for row in rows:
                cols = [c.inner_text().strip() for c in row.locator("td").all()]
                # केवल वे पंक्तियाँ लें जिनमें टेंडर का नंबर, रेफ़रेंस और बंद होने की तारीख (जैसे 2026) हो
                if len(cols) >= 3:
                    raw_title = re.sub(r'\s+', ' ', cols)
                    closing_date = re.sub(r'\s+', ' ', cols)
                    lower_title = raw_title.lower()

                    # फालतू मेनू और फ़ुटर लाइनों को रोकें
                    if any(junk in lower_title for junk in JUNK_KEYWORDS):
                        continue
                    if "2026" not in closing_date and "2027" not in closing_date:
                        continue
                    if len(raw_title) < 15 or len(raw_title) > 250:
                        continue

                    # आगे के सीरियल नंबर (जैसे "1. ", "2. ") हटाकर साफ़ टाइटल बनाएं
                    clean_title = re.sub(r'^\d+\.\s*', '', raw_title)
                    if clean_title in seen_titles:
                        continue
                    seen_titles.add(clean_title)

                    ref_no = re.sub(r'\s+', ' ', cols) if cols else f"ASM-{datetime.now().strftime('%Y%m')}-{len(live_tenders)+1}"
                    district = detect_district(clean_title)
                    dept = detect_department(clean_title, ref_no)

                    live_tenders.append({
                        "state": "Assam",
                        "district": district,
                        "location": f"{district}, Assam",
                        "winRate": "High Win Rate",
                        "title": clean_title[:140],
                        "estimate": "View BoQ on Official Portal",
                        "department": dept,
                        "ref": ref_no[:45],
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

    print(f"Total {len(final_output)} clean tenders saved to tenders.json.")

if __name__ == "__main__":
    scrape_assam_tenders()
