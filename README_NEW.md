# DSS Antigravity - Customer Churn Decision Support System

A telecom customer churn prediction system with **Machine Learning**, **Backend API**, and **React Dashboard**.

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.10+** - [Download](https://www.python.org/)
- **MongoDB** - [Install locally](https://www.mongodb.com/try/download/community) or [Use Atlas (cloud)](https://www.mongodb.com/cloud/atlas)

## 🚀 Quick Start (30 seconds)

Just run this file:

```batch
start-all.bat
```

This will:
- ✅ Start Backend (NestJS) on `http://localhost:3001`
- ✅ Start Frontend (React) on `http://localhost:3000`  
- ✅ Start ML API (Python) on `http://localhost:5000`

All in **3 separate terminal windows** 🎉

## 📁 Project Structure

```
DSS_Antigravity/
├── backend-nestjs/         # API server (NestJS)
├── frontend-react/         # Web dashboard (React)
├── ml-python/             # ML models (Python/Flask)
├── start-all.bat          # ⭐ Run everything with this
└── README.md
```

## ✨ Features

### 📊 Dashboard
- Real-time metrics & charts
- Customer churn rate tracking
- Risk-level visualization

### 👥 Customers Management
- CRUD operations
- CSV bulk import
- Search & filter
- Pagination

### 🔮 Predictions
- Real-time churn prediction
- Risk assessment (HIGH/MEDIUM/LOW)
- Smart retention recommendations

### 🤖 ML Models
- **Random Forest** (80.5% accuracy)
- **Logistic Regression**
- **Decision Tree**

## 🛠️ Manual Setup (If Needed)

**Terminal 1 - Backend:**
```bash
cd backend-nestjs
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm start
```

**Terminal 3 - ML API:**
```bash
cd ml-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python predict_api.py
```

## 🔧 Configuration

Backend `.env` (auto-created):
```env
MONGODB_URI=mongodb://localhost:27017/DSS2
ML_API_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
```

## 📡 API Endpoints

**Customers:**
- `POST /api/customers` - Create
- `GET /api/customers` - List with pagination
- `GET /api/customers/:id` - Get by ID
- `DELETE /api/customers/:id` - Delete

**Predictions:**
- `POST /api/predictions` - Create prediction
- `GET /api/predictions` - List
- `GET /api/predictions/high-risk` - Filter by risk

**Health:**
- `GET /api/health` - System status

## 🚨 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Change `PORT` in `backend-nestjs/.env` |
| MongoDB connection failed | Start MongoDB or update `MONGODB_URI` in `.env` with Atlas |
| Python/Node not found | Install from prerequisites section |
| Virtual environment error | Delete `ml-python/venv` folder and re-run `start-all.bat` |

## 📥 Data Import

Use `customers_template.csv` or `WA_Fn-UseC_-Telco-Customer-Churn.csv`:

1. Open Frontend at `http://localhost:3000`
2. Go to **Customers** page
3. Click **Import CSV**
4. Select your CSV file
5. Done!

## 🏗️ Tech Stack

| Component | Tech |
|-----------|------|
| Backend | NestJS 10 + MongoDB |
| Frontend | React 18 + Tailwind CSS |
| ML | Scikit-learn + Flask |
| Language | TypeScript + Python |

## 📚 Documentation

- [Backend Guide](backend-nestjs/README.md)
- [Frontend Guide](frontend-react/README.md)
- [ML Pipeline Guide](ml-python/README.md)

## 📝 License

MIT

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
