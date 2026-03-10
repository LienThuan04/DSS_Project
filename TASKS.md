# TASKS.md — DSS Customer Churn Prediction Project

**Goal**: Upgrade the current system into a **real Decision Support System (DSS)** for **Telecom Customer Churn Prediction**.

**Tech Stack**:
- Frontend: React + TypeScript (`frontend-react/`)
- Backend: NestJS + TypeScript + MongoDB (`backend-nestjs/`)
- ML Service: Python + scikit-learn + Flask (`ml-python/`)

---

## Quick Navigation

This project is organized into 4 separate, implementation-ready task files:

| File | Content | Focus |
|------|---------|-------|
| [TASKS_BACKEND.md](TASKS_BACKEND.md) | BE-01 to BE-07, DSS-01, DSS-02, DSS-03 | NestJS API, MongoDB, recommendation engine, what-if backend |
| [TASKS_FRONTEND.md](TASKS_FRONTEND.md) | FE-01 to FE-05, DSS-04, DSS-06 | React UI, prediction UX, dashboard, what-if UI, explainability UI |
| [TASKS_ML.md](TASKS_ML.md) | ML-01 to ML-07, DSS-05 | Python pipeline, model training, prediction API, explainability |
| [TASKS_DOCS.md](TASKS_DOCS.md) | SETUP-02, SETUP-03, SETUP-04, DOC-01 to DOC-03 | Documentation, reporting, repository setup |

---

## Project Overview

### Decision Support System (DSS) Features

1. **Recommendation Rules Engine** (DSS-01, DSS-02)
   - Input: customer attributes + churn probability
   - Output: business recommendation + priority (LOW/NORMAL/HIGH/URGENT)

2. **What-if Simulation** (DSS-03, DSS-04, FE-05)
   - Modify customer attributes
   - See how prediction changes
   - Compare base vs. scenario side-by-side

3. **Explainability** (DSS-05, DSS-06, ML-07)
   - Show top 5 factors influencing prediction
   - Feature importance or SHAP values
   - Bar chart visualization

4. **Prediction Workflow**
   - Predict for existing DB customer
   - Predict from ad-hoc input form
   - View prediction history per customer

5. **Analytics Dashboard**
   - Risk distribution (HIGH/MEDIUM/LOW)
   - Churn rates by customer segments (Contract, Internet Service, Payment Method)
   - Key metrics

---

## Task Summary by Component

### Backend (NestJS + MongoDB + Recommendation)
- **SETUP-01**: Backend `.env.example`
- **BE-01** to **BE-07**: Core backend functionality
- **DSS-01** to **DSS-03**: Recommendation rules and what-if API

**Total**: 11 tasks | **Time estimate**: 2-3 weeks

### Frontend (React + TypeScript + UI)
- **SETUP-01**: Frontend `.env.example`
- **FE-01** to **FE-05**: UI components and pages
- **DSS-04, DSS-06**: What-if UI and explainability panel

**Total**: 8 tasks | **Time estimate**: 2-3 weeks

### ML Service (Python + scikit-learn)
- **ML-01** to **ML-07**: Pipeline, models, prediction API
- **DSS-05**: Explainability (feature importance/SHAP)

**Total**: 8 tasks | **Time estimate**: 1-2 weeks

### Documentation & Setup
- **SETUP-02, SETUP-03, SETUP-04**: General repository setup
- **DOC-01** to **DOC-03**: Comprehensive report, demo checklist, screenshots

**Total**: 6 tasks | **Time estimate**: 1 week

---

## All Tasks at a Glance

### 0) Setup / Repo Hygiene
- [x] **SETUP-01** — Backend & frontend `.env.example` files ✅ (completed)
- [x] **SETUP-02** — Root `docs/` folder ✅ (completed)
- [x] **SETUP-03** — Root `TASKS.md` (this file) ✅ (completed)
- [x] **SETUP-04** — Clean up README duplication ✅ (completed)

### 1) DSS Features
- [x] **DSS-01** — Recommendation rules engine (backend) ✅ (completed)
- [x] **DSS-02** — DSS output fields in API response ✅ (completed)
- [x] **DSS-03** — What-if simulation API (backend) ✅ (completed)
- [x] **DSS-04** — What-if simulation UI (frontend) ✅ (completed)
- [x] **DSS-05** — Explainability output (ML) ✅ (completed)
- [x] **DSS-06** — Explainability panel UI (frontend) ✅ (completed)

### 2) ML Service
- [x] **ML-01** — Unified pipeline command ✅ (completed)
- [x] **ML-02** — Model comparison export ✅ (completed)
- [x] **ML-03** — Cross-validation reporting ✅ (completed)
- [x] **ML-04** — Class imbalance handling ✅ (completed)
- [x] **ML-05** — Input schema definition ✅ (completed)
- [x] **ML-06** — Improved prediction API ✅ (completed)
- [ ] **ML-07** — SHAP implementation (optional)

### 3) Backend
- [x] **BE-01** — MongoDB schemas (Customer, Prediction) ✅ (completed)
- [x] **BE-02** — Prediction history storage ✅ (completed)
- [x] **BE-03** — Predict endpoint for existing customer ✅ (completed)
- [x] **BE-04** — Predict endpoint for raw input ✅ (completed)
- [x] **BE-05** — Prediction stats endpoint ✅ (completed)
- [x] **BE-06** — Enhanced error handling ✅ (completed)
- [x] **BE-07** — CSV import validation ✅ (completed)

### 4) Frontend
- [x] **FE-01** — Predict action in Customers list ✅ (completed)
- [x] **FE-02** — New Prediction form page ✅ (completed)
- [x] **FE-03** — Dashboard risk distribution chart ✅ (completed)
- [x] **FE-04** — Dashboard churn segmentation charts ✅ (completed)
- [x] **FE-05** — What-if simulation UI (same as DSS-04) ✅ (completed)

### 5) Documentation
- [x] **DOC-01** — Comprehensive report (`docs/report.md`) ✅ (completed)
- [x] **DOC-02** — Demo checklist (`docs/demo-checklist.md`) ✅ (completed)
- [x] **DOC-03** — Screenshots folder & API reference (`docs/API.md`, `QUICK_START.md`) ✅ (completed)

---

## Recommended Implementation Order (Fastest Path to "Demo Ready")

### Phase 1: Foundation (Week 1)
1. **SETUP** tasks (repo hygiene)
2. **BE-01, BE-02** (MongoDB schemas & history)
3. **ML-05** (Input schema)
4. **ML-01** (Unified pipeline)

### Phase 2: Core Features (Week 2)
5. **DSS-01** (Recommendation rules) — backend only
6. **DSS-02** (DSS API response fields)
7. **BE-03** (Predict for existing customer)
8. **ML-06** (Improved prediction API)
9. **FE-01** (Predict action in Customers list)

### Phase 3: Advanced Features (Week 3)
10. **FE-02** (New Prediction form)
11. **FE-03, FE-04** (Dashboard charts)
12. **DSS-03** (What-if API)
13. **DSS-04/FE-05** (What-if UI)
14. **DSS-05, DSS-06** (Explainability: backend + frontend)

### Phase 4: Polish & Documentation (Week 4)
15. **BE-04, BE-05, BE-06, BE-07** (Additional endpoints & error handling)
16. **ML-02, ML-03, ML-04, ML-07** (Model improvements & reporting)
17. **DOC** tasks (report, demo checklist, screenshots)

---

## Key Dependencies

- **BE-01** must complete before: BE-02, BE-03, BE-04, BE-05, BE-07
- **DSS-01** must complete before: DSS-02, BE-03
- **ML-05** (input schema) must complete before: FE-02, BE-04, BE-07
- **BE-03** must complete before: FE-01, DSS-03
- **FE-01** can start after: BE-03, ML-06
- **DSS-03** depends on: BE-03 (and optionally ML-05)
- **Documentation** can start immediately; gather screenshots as features complete

---

## Difficulty Guide

- **S (Small)**: 1–2 days, straightforward implementation
- **M (Medium)**: 3–5 days, requires design decisions and testing
- **L (Large)**: 5+ days, complex features or multiple dependencies

---

## Progress Tracking

Track completion in the individual task files:
- ✅ Check items in acceptance criteria as they complete
- ✅ Update this document periodically
- ✅ Link to PRs or branches when tasks are in progress

---

## Folder Structure

```
DSS_Antigravity/
├── TASKS.md                          # This file — central reference
├── TASKS_BACKEND.md                  # Backend-specific tasks
├── TASKS_FRONTEND.md                 # Frontend-specific tasks
├── TASKS_ML.md                       # ML-specific tasks
├── TASKS_DOCS.md                     # Documentation & setup tasks
├── README.md                         # Main project README
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  # Dataset
├── telco_customer_churn.ipynb        # EDA notebook
│
├── backend-nestjs/                   # NestJS backend
│   ├── .env.example
│   ├── src/
│   │   ├── predictions/
│   │   ├── customers/
│   │   └── common/services/
│   └── ...
│
├── frontend-react/                   # React frontend
│   ├── .env.example
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── ...
│
├── ml-python/                        # Python ML service
│   ├── input_schema.json
│   ├── run_pipeline.py
│   ├── train_model.py
│   ├── predict_api.py
│   ├── evaluation_results/
│   └── ...
│
├── docs/                             # Project documentation
│   ├── report.md                     # Comprehensive report
│   ├── demo-checklist.md             # Demo walkthrough
│   ├── api-reference.md              # API documentation
│   ├── SETUP.md                      # Deployment guide
│   ├── SUMMARY.md                    # Executive summary
│   ├── screenshots/                  # UI screenshots
│   ├── diagrams/                     # Architecture diagrams
│   └── ...
│
└── start-all.bat                     # Batch script to start services

```

---

## Communication & Status

- **Weekly sync**: Review progress against phases
- **Blockers**: Log in issue tracker, link to relevant task file
- **PR reviews**: Reference task ID and acceptance criteria
- **Demo**: Use `docs/demo-checklist.md` as a script

---

## Future Enhancements (Post-MVP)

- Real-time prediction updates
- A/B testing for recommendation strategies
- Mobile app
- Batch prediction API
- Model retraining schedule
- Integration with CRM system
- Audit trails for all predictions

