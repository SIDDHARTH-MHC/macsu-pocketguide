# MAC Pocket Guide 2026

Mobile-first web app — successor to the *Pocket Guide For Freshies 2024* PDF.

**Presented by:** Student Union 2025-26 & ABVP  
**College:** Maharaja Agrasen College, University of Delhi

## Run locally

```bash
cd "macsu guide"
python3 -m http.server 8765
```

Open http://localhost:8765

## Update content each year

Edit **`data/guide.json` only** — names, phones, societies, fees, committees. No layout changes needed.

## Stack

Static HTML/CSS/JS · PWA (offline + Add to Home Screen) · no build step

## Sources

- 2024 PDF pocket guide (content base)
- Official fee structure & admission committees 2026–27
- [MAC Freshers' Portal](https://mac-dashboard--rupanshurrajmac.replit.app/) (union + help desk)
- `REQUIREMENTS.md` in this folder
