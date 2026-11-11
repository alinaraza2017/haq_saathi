# Haq Saathi · حق ساتھی

**A voice-first Urdu/English legal-rights companion for women in Pakistan.**
Speak (or type) what happened in your own words → understand which laws protect you, where to go, what to do next, what evidence to keep, and get a ready-to-file complaint letter.

> Hackathon prototype · Domain: Women's Empowerment · **SDG 5** (Gender Equality) & **SDG 16** (Peace, Justice & Strong Institutions)

---

## The problem

Pakistan has strong laws for women — workplace harassment, domestic violence, cyber-harassment, inheritance — but most women never use them:

- Laws are written in legal English; many women read Urdu, or prefer to speak rather than read.
- Women don't know **which forum** handles their case (police? Ombudsperson? Family Court? NCCIA?).
- Seeking help can be dangerous: an abuser may check the phone.
- Lawyers are expensive; the first step (a written complaint) is a barrier on its own.

## What Haq Saathi does

| # | Feature | Notes |
|---|---------|-------|
| 1 | **Voice-first home** | Huge mic button "اپنی بات بتائیں", text alternative, Urdu ⇄ English toggle, full RTL with Noto Nastaliq Urdu. No login. |
| 2 | **Quick Exit** | Fixed top-right button **and Esc key** → clears sessionStorage/localStorage and `location.replace()`s to a Google weather search (Back button won't return). |
| 3 | **AI analysis** | Voice note (MediaRecorder → base64 inline audio) or text → Gemini with the full `laws.json` in the system prompt and a **forced JSON schema**. `applicable_law_ids` is an `enum` of our ids *and* filtered client-side. |
| 4 | **Emergency first** | `urgency = emergency` → red banner with **15** and **1099** call buttons *before* anything else. |
| 5 | **Results** | Cards: Your Rights (per-law cards with section no. + disclaimer), Where to Go, Next Steps, Evidence checklist. Read-aloud via `speechSynthesis` (ur-PK when available). |
| 6 | **Complaint draft** | Formal letter to the correct forum, English + Urdu, with `[YOUR NAME] [CNIC] [ADDRESS] [DATE]` placeholders filled **locally**. Editable; English → jsPDF download, Urdu → print stylesheet (proper Nastaliq shaping). |
| 7 | **Follow-up chat** | Grounded in `laws.json` + the case summary. |
| 8 | **Help directory** | `helplines.json` with `tel:` links. |
| 9 | **Impact dashboard** `/impact` | Opt-in only. Firestore stores **only** `{category, city, urgency, timestamp}`. Recharts by category & city. 40 clearly-labelled demo records. |
| 10 | **Demo scenarios** | 3 prepared stories (boss harassment, husband violence + threats, brothers denying inheritance), each with a prepared offline fallback so the live demo survives no mic / no network. |

## Architecture

```mermaid
flowchart LR
  U((User<br/>phone browser)) -->|voice webm / text| UI[React SPA<br/>Vite + Tailwind]
  UI -->|redact CNIC/phone/name| R[redact.ts]
  R --> L[legal.ts<br/>prompts + JSON schemas]
  KB[(laws.json<br/>helplines.json)] --> L
  L --> AI[ai.ts<br/>single provider switch]
  AI -->|VITE_AI_PROVIDER=firebase| FB[Firebase AI Logic<br/>firebase/ai · Gemini Developer API]
  AI -->|VITE_AI_PROVIDER=genai| GG[@google/genai<br/>VITE_GEMINI_API_KEY]
  FB --> G[Gemini Flash]
  GG --> G
  UI -->|opt-in only: category, city,<br/>urgency, timestamp| FS[(Cloud Firestore<br/>stats)]
  FS --> D[/impact dashboard<br/>Recharts/]
  UI -.->|state| SS[(sessionStorage<br/>wiped by Quick Exit)]
  H[Firebase Hosting] --- UI
```

### Project layout

```
src/
  data/laws.json            knowledge base (every entry "verified": false)
  data/helplines.json       15, 1099, 1043, FOSPAH, DRF, 1122
  data/demoScenarios.ts     3 demo stories + offline fallback results
  services/ai.ts            ONLY module that calls Gemini (provider switch)
  services/legal.ts         analyse / draftComplaint / followUp + schemas
  services/stats.ts         Firestore opt-in stats + 40 demo records
  services/firebase.ts      Firebase init from VITE_FIREBASE_* env
  lib/redact.ts             strips CNIC, phone, email, "my name is X"
  lib/i18n.tsx              Urdu/English strings, RTL switching
  lib/caseStore.tsx         case state in sessionStorage only
  pages/                    Home, Results, Complaint, Chat, Help, Impact
firestore.rules             create-only, 4 whitelisted fields
firebase.json               Hosting (SPA rewrite) + rules
```

## Running locally

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in either the Firebase web config (Firebase AI Logic) **or** `VITE_AI_PROVIDER=genai` + `VITE_GEMINI_API_KEY`, then:

```bash
npm run dev
```

With no keys at all the app still runs: the three demo scenarios fall back to prepared results and the complaint page falls back to a local template.

### Switching AI provider (1 line)

```
VITE_AI_PROVIDER=firebase   # Firebase AI Logic (recommended — no API key in the bundle)
VITE_AI_PROVIDER=genai      # @google/genai direct (demo fallback — key is visible in the browser)
VITE_GEMINI_MODEL=gemini-3.8-flash
```

### Firebase setup

1. Create a Firebase project → add a Web app → copy config into `.env`.
2. Console → **AI Logic** → Get started → choose **Gemini Developer API**.
3. Console → **Firestore** → create database. Deploy rules: `npx firebase-tools deploy --only firestore:rules`.
4. (Recommended) Enable **App Check** for AI Logic and Firestore before sharing the URL publicly.

### Deploy

```bash
npm run build && npx firebase-tools deploy --only hosting
```

## Tech stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · React Router 7 · Firebase 13 (AI Logic, Firestore, Hosting) · @google/genai (fallback) · Recharts · jsPDF · Web Speech API (`speechSynthesis`) · MediaRecorder API · Noto Nastaliq Urdu / Inter.

## AI tools used

- **Claude Code** — scaffolding, implementation and documentation of this prototype.
- **Google Gemini (Flash)** — runtime: speech understanding (Urdu/English audio), case analysis into a fixed JSON schema, bilingual complaint drafting, grounded follow-up chat.

## Responsible-AI notes

- **Grounded, closed-set legal citations.** The model may only cite laws whose ids are in `laws.json` (JSON-schema `enum` + client-side filter). It cannot invent a section number that we display.
- **Not legal advice.** Every law card, the complaint page and the chat show: *"AI-generated guidance, not legal advice. Verify with 1099 or a lawyer."*
- **Safety first.** Emergency triage is the first thing rendered; 15/1099 are one tap away. Quick Exit + Esc for users whose phones may be monitored. `noindex`, `no-referrer`.
- **Data minimisation.** No login, no accounts. Text is redacted (CNIC, phone, email, "my name is…") before it is sent. Personal details for the complaint are entered locally and never sent to the AI or stored. Case state lives only in sessionStorage. Research stats are **opt-in** and limited to 4 fields by Firestore rules.
- **Trauma-informed prompt.** No victim-blaming, simple Urdu, short validation, no graphic language.
- **Honest demo data.** The 40 seeded dashboard records are marked "Demo (seeded)", rendered in a different colour, and never written to Firestore.

## Limitations

- **Legal content is unverified.** Every entry has `"verified": false` and must be checked against [pakistancode.gov.pk](https://pakistancode.gov.pk) and provincial codes before real use. In particular, the in-force status and section numbering of the **ICT Domestic Violence (Prevention & Protection) Act 2020** must be confirmed, and PECA forum details changed after the 2025 amendments (NCCIA).
- Coverage is limited to ~13 provisions; provincial variations (Sindh, KP, Balochistan) are only partly reflected.
- Voice notes are sent as audio — the redaction step can't remove a name spoken aloud (the UI tells users they don't need to say names).
- Urdu text-to-speech depends on the device having an Urdu voice; otherwise it reads the English version.
- With `VITE_AI_PROVIDER=genai`, the API key is in the client bundle — demo only. Use Firebase AI Logic + App Check for anything public.
- Urdu PDFs use the browser's print-to-PDF (jsPDF can't shape Nastaliq).
- No human review loop or escalation to real caseworkers yet.
