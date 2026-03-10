# DSS Antigravity - Customer Churn Decision Support System

A telecom customer churn prediction system with **Machine Learning**, **Backend API**, and **React Dashboard**.

---

## 📋 Prerequisites

Install these first:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.10+** - [Download](https://www.python.org/)
- **MongoDB** - [Install locally](https://www.mongodb.com/try/download/community) or [Use Atlas (cloud)](https://www.mongodb.com/cloud/atlas)

Verify installation:
```bash
node --version    # Should be 18+
python --version  # Should be 3.10+
```

---

## � Installation (First Time Setup)

### After Cloning/Pulling the Project

Run this **once** to install all dependencies:

#### Backend Dependencies
```batch
cd backend-nestjs
npm install
```

#### Frontend Dependencies
```batch
cd frontend-react
npm install
```

#### ML API Dependencies
```batch
cd ml-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Or just run `start-all.bat` - it handles everything automatically!**

---

## �🚀 Quick Start (30 Seconds)

### Run Everything with One Click

**Just double-click this file:**
```
start-all.bat
```

✅ Automatically starts:
- **Backend (NestJS)** on http://localhost:3001
- **Frontend (React)** on http://localhost:3000
- **ML API (Python)** on http://localhost:5000

That's it! The browser will open automatically. Wait 1-2 minutes for all services to start.

---

## 📁 Project Structure

```
DSS_Antigravity/
├── start-all.bat              ⭐ RUN THIS FOR EVERYTHING
├── backend-nestjs/            API server (NestJS, port 3001)
├── frontend-react/            Web dashboard (React, port 3000)
├── ml-python/                ML models (Flask, port 5000)
├── customers_template.csv     Sample data for import
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  Full dataset
└── README.md                  This file
```

---

## ✨ Features

### 📊 Dashboard
- Real-time metrics and charts
- Customer churn rate tracking
- Risk-level visualization
- Auto-refreshing every 30 seconds

### 👥 Customer Management
- CRUD operations (Create, Read, Update, Delete)
- CSV bulk import with validation
- Search and filter customers
- Pagination (20 per page)
- Visual churn status indicators

### 🔮 Predictions
- Real-time churn probability prediction
- Risk assessment: HIGH (>75%), MEDIUM (50-75%), LOW (<50%)
- Smart retention recommendations
- Batch prediction support

### 🤖 ML Models
- **Random Forest** - 80.5% accuracy ⭐ Best
- **Logistic Regression** - 78.2% accuracy
- **Decision Tree** - 76.9% accuracy

---

## 🛠️ Manual Startup (If Needed)

If `start-all.bat` doesn't work, start each service manually in **3 separate CMD windows:**

### Terminal 1 - Backend
```batch
cd backend-nestjs
npm run start:dev
```

### Terminal 2 - Frontend
```batch
cd frontend-react
npm start
```

### Terminal 3 - ML API
```batch
cd ml-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python predict_api.py
```

---

## 🔧 Configuration

Backend configuration (auto-created):

**File:** `backend-nestjs/.env`
```env
MONGODB_URI=mongodb://localhost:27017/DSS2
ML_API_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
```

If using MongoDB Atlas instead of local:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DSS2
```

---

## 📥 CSV Import

**Sample file:** `customers_template.csv`  
**Full dataset:** `WA_Fn-UseC_-Telco-Customer-Churn.csv`

Steps:
1. Open http://localhost:3000
2. Go to **Customers** tab
3. Click **Import CSV**
4. Select CSV file
5. Done! ✅

Required columns: `customerID, gender, tenure, MonthlyCharges, Churn, ...`

---

## 📡 API Endpoints

### Customers
```
GET    /api/customers              List customers
POST   /api/customers              Create customer
GET    /api/customers/:id          Get customer
PUT    /api/customers/:id          Update customer
DELETE /api/customers/:id          Delete customer
POST   /api/customers/import       Import CSV
GET    /api/customers/stats        Get statistics
```

### Predictions
```
GET    /api/predictions            List predictions
POST   /api/predictions            Create prediction
GET    /api/predictions/high-risk  HIGH risk only (>75%)
GET    /api/predictions/medium-risk MEDIUM risk (50-75%)
GET    /api/predictions/low-risk   LOW risk (<50%)
```

### Health
```
GET    /api/health                 System status
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port already in use** | Update `PORT` in `backend-nestjs/.env` to 3002 or 3003 |
| **MongoDB connection error** | Install MongoDB locally OR use MongoDB Atlas with connection string in `.env` |
| **"Python not found"** | Install from https://www.python.org/ and restart terminal |
| **"npm not found"** | Install Node.js from https://nodejs.org/ and restart terminal |
| **start-all.bat closes instantly** | Run each service manually to see error message |
| **Virtual environment error** | Delete `ml-python/venv` folder and re-run start-all.bat |
| **CSV import fails** | Check CSV encoding (must be UTF-8) and format matches template |

### Diagnostic Commands
```batch
REM Check which process is using a port
netstat -ano | findstr :3001

REM Kill a process (replace PID)
taskkill /PID 1234 /F

REM Check software versions
node --version
python --version
```

---

## 🏗️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend API | NestJS | 10.x |
| Database | MongoDB + Mongoose | 6-7.x |
| Frontend SPA | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| ML Framework | Scikit-learn | 1.2.x |
| ML API | Flask | 2.3.x |
| Language | TypeScript + Python | 5.x, 3.10+ |

---

## 📚 Documentation

- [Backend NestJS Setup](backend-nestjs/README.md)
- [Frontend React Guide](frontend-react/README.md)
- [ML Pipeline & Models](ml-python/README.md)

---

## ✅ Deployment Checklist

Before production:
- [ ] All services running locally
- [ ] MongoDB backup configured
- [ ] `.env` variables set correctly
- [ ] CSV import tested
- [ ] API endpoints responding
- [ ] Frontend loads dashboard
- [ ] Predictions working end-to-end

---

## 📝 License

MIT - Free to use

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** March 2026

npm start -- --inspect

# Python
python -u predict_api.py
```

---

## 📝 License

**MIT License** - Free to use and modify

---

## 📊 Project Status

| Component | Status | Version |
|-----------|--------|---------|
| Backend | ✅ Production Ready | 1.0.0 |
| Frontend | ✅ Production Ready | 1.0.0 |
| ML Pipeline | ✅ Production Ready | 1.0.0 |
| **Overall** | **✅ STABLE** | **1.0.0** |

**Last Updated**: March 2026  
**Maintenance**: Active  
**Contributors**: Welcome!

---

## 🎯 Next Steps

1. ✅ Run `start-all.bat`
2. ✅ Wait for services to start (~30 seconds)
3. ✅ Open http://localhost:3000 in your browser
4. ✅ Import `customers_template.csv` for sample data
5. ✅ Try making a prediction!

**Happy analyzing!** 🚀
