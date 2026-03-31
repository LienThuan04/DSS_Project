# 📊 DSS Project - Hệ Thống Hỗ Trợ Quyết Định Churn Prediction

**Customer Churn Prediction System** - Dự đoán những khách hàng có nguy cơ churn để thực hiện các hành động giữ chân kịp thời.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts
- **Backend**: NestJS 10 + MongoDB 7 + Axios
- **ML**: Python (Decision Tree - Scikit-learn) + Flask 2.3
- **Database**: MongoDB (Local hoặc Cloud Atlas)

---

## ⚡ QUICK START

### 🎯 Lần Đầu Tiên (Setup)

```cmd
setup.bat
```

⏱️ Thời gian: ~10-20 phút (cài dependencies, train model, setup toàn bộ)

Lệnh này sẽ **tự động**:
- ✅ Kiểm tra Node.js, Python
- ✅ Cài Backend dependencies (NestJS)
- ✅ Cài Frontend dependencies (React)
- ✅ Tạo Python virtual environment
- ✅ Cài ML dependencies
- ✅ Xử lý dữ liệu (Data Preprocessing)
- ✅ Train Decision Tree model
- ✅ Khởi chạy tất cả services (Backend, Frontend, ML API)

### 🚀 Lần Chạy Tiếp Theo

```cmd
start-all.bat
```

⏱️ Thời gian: ~2-3 phút (chỉ khởi chạy services)

---

## 📱 Truy Cập Ứng Dụng

Sau khi khởi động thành công, mở browser:

| Địa chỉ | Mục đích |
|---------|---------|
| **http://localhost:3000** | 🎯 **Frontend** - Giao diện chính |
| http://localhost:3001/api | Backend API |
| http://localhost:5000/health | ML API health check |

---

## ✨ CẬP NHẬT VÀ TÍNH NĂNG MỚI

### 🌳 ML Model - Decision Tree Only
- ✅ Chỉ sử dụng **Decision Tree** (tối ưu hóa hiệu năng)
- ❌ Loại bỏ Logistic Regression & Random Forest
- 🔥 **Fix Data Leakage**: Scaler fit trên train set, transform riêng cho test set
- ⚡ Nhanh chóng cho real-time predictions
- 🧠 Dễ giải thích (feature importance)

### 📋 Frontend - Predictions Page
- ✨ **Quick Form** (8 essential fields) - Form đơn giản & nhanh
- 📝 **Full Form** (19 fields) - Form đầy đủ tất cả trường
- 🔘 **Toggle Button** - Dễ dàng chuyển đổi giữa 2 form
- 👤 **Customer ID Display** - Hiển thị ID khách hàng trong kết quả
- 🔄 **Instant Delete** - Xóa dự đoán mà không cần modal xác nhận

### 🔧 Backend - Improvements  
- ✅ Tích hợp Decision Tree model
- ✅ Cải thiện recommendation logic
- ✅ Optimized predictions API
- ✅ MongoDB integration improvements

---

## 📋 YÊU CẦU HỆ THỐNG

**Trước khi bắt đầu, bạn PHẢI cài đặt:**

| Phần mềm | Phiên bản | Tải | Ghi chú |
|---------|----------|-----|--------|
| **Node.js** | v14+ | [nodejs.org](https://nodejs.org/) | npm được cài tự động |
| **Python** | 3.8+ | [python.org](https://www.python.org/) | Chọn "Add Python to PATH" |
| **MongoDB** | - | [Tùy chọn dưới](#database--mongodb) | Local hoặc Cloud Atlas |

**Kiểm tra cài đặt:**
```cmd
node --version
npm --version
python --version
```

---

## 🗂️ CẤU TRÚC DỰ ÁN

```
DSS_Project/
├── setup.bat                              # ⚡ Chạy lần đầu (setup + dependencies)
├── start-all.bat                          # 🚀 Chạy từ lần 2 trở đi
├── README.md                              # File hướng dẫn này
│
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  # 📊 Dữ liệu training (bạn phải có)
│
├── frontend-react/                        # ⚛️ React UI (port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.tsx        # Form dự đoán đầy đủ (19 fields)
│   │   │   ├── SimplePredictionForm.tsx  # ✨ Form nhanh (8 fields)
│   │   │   ├── PredictionResultCard.tsx  # ✨ Kết quả + Customer ID
│   │   │   └── WhatIfForm.tsx            # What-If analysis
│   │   └── pages/
│   │       ├── Dashboard.tsx
│   │       ├── Customers.tsx
│   │       ├── Predictions.tsx           # ✨ CẬP NHẬT: toggle form
│   │       └── WhatIfSimulation.tsx
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── .env.local (tạo theo hướng dẫn)
│
├── backend-nestjs/                        # 🏗️ NestJS API (port 3001)
│   ├── src/
│   │   ├── common/
│   │   │   └── services/
│   │   │       ├── ml.service.ts         # Tích hợp ML API
│   │   │       ├── recommendation.service.ts
│   │   │       └── validation.service.ts
│   │   ├── customers/                    # Module khách hàng
│   │   ├── predictions/                  # Module dự đoán
│   │   └── main.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── .env (tạo tự động hoặc theo hướng dẫn)
│
├── ml-python/                             # 🐍 Decision Tree + Flask (port 5000)
│   ├── data_preprocessing.py              # Xử lý dữ liệu
│   ├── eda_analysis.py                   # Phân tích dữ liệu
│   ├── train_model.py                    # ✨ Train Decision Tree
│   ├── evaluate_model.py                 # Đánh giá model
│   ├── predict_api.py                    # Flask REST API
│   ├── run_pipeline.py                   # Chạy toàn bộ quy trình
│   ├── model.pkl                         # Model (auto-generated)
│   ├── scaler.pkl                        # Data scaler (auto-generated)
│   ├── label_encoders.pkl                # Encoders (auto-generated)
│   ├── requirements.txt
│   └── venv/                             # Python virtual environment
│
└── customers_template.csv                 # Template CSV
```

---

## 🔧 CẤU HÌNH ENVIRONMENT VARIABLES

### Backend Configuration: `backend-nestjs/.env`

**File này được tạo TỰ ĐỘNG** bởi `setup.bat`, nhưng bạn có thể chỉnh sửa thủ công nếu cần:

```env
# ========================================
# Database
# ========================================

# Nếu dùng MongoDB Local (mặc định):
MONGODB_URI=mongodb://localhost:27017/DSS2

# Nếu dùng MongoDB Cloud (Atlas):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DSS2?retryWrites=true&w=majority

# ========================================
# Server
# ========================================
PORT=3001
NODE_ENV=development

# ========================================
# ML API
# ========================================
ML_API_URL=http://localhost:5000
```

**Chi tiết các biến:**

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| **MONGODB_URI** | `mongodb://localhost:27017/DSS2` | Connection string MongoDB |
| **PORT** | `3001` | Port backend chạy |
| **NODE_ENV** | `development` | Môi trường (development/production) |
| **ML_API_URL** | `http://localhost:5000` | URL ML API server |

### Frontend Configuration: `frontend-react/.env.local`

**Tạo file nếu chưa có:**

```env
REACT_APP_API_URL=http://localhost:3001/api
```

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| **REACT_APP_API_URL** | `http://localhost:3001/api` | Backend API URL (phải kết thúc bằng `/api`) |

---

## 💾 DATABASE - MongoDB

### 🔹 Tùy Chọn 1: MongoDB Cloud (Khuyến nghị)

**Lợi ích:**
- ✅ Miễn phí (500MB storage)
- ✅ Không cần cài đặt local
- ✅ Truy cập từ bất kỳ máy nào

**Cách setup:**
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Tạo tài khoản miễn phí
3. Tạo cluster
4. Lấy connection string
5. Thay vào `MONGODB_URI` trong `.env`:
   ```
   mongodb+srv://your_username:your_password@your_cluster.mongodb.net/DSS2?retryWrites=true&w=majority
   ```

**Lưu ý:** Trong MongoDB Atlas, phải add IP whitelist thành `0.0.0.0/0` để allow tất cả IP.

### 🔹 Tùy Chọn 2: MongoDB Local

**Lợi ích:**
- ✅ Không cần Internet
- ✅ Dữ liệu local

**Cách setup:**
1. Tải: https://www.mongodb.com/try/download/community
2. Cài đặt mặc định
3. Khởi động MongoDB service:
   - **Windows**: `mongod` hoặc MongoDB Compass
   - **macOS/Linux**: `mongod`
4. Connection string: `mongodb://localhost:27017/DSS2`

---

## 🚀 CHI TIẾT TỪNG BƯỚC KHỞI CHẠY

### BƯỚC 1: Chuẩn Bị

1. ✅ Cài Node.js, Python, MongoDB
2. ✅ Có file dữ liệu: `WA_Fn-UseC_-Telco-Customer-Churn.csv`
3. ✅ Đặt file CSV vào **thư mục gốc** (cùng với `setup.bat`)

### BƯỚC 2: Lần Chạy Đầu Tiên

Mở **PowerShell** hoặc **CMD**, điều hướng vào thư mục gốc, chạy:

```cmd
setup.bat
```

**Quá trình tự động:**
| Bước | Việc làm | Thời gian |
|------|----------|----------|
| 1 | Kiểm tra Node.js, Python | < 1 phút |
| 2 | Cài Backend dependencies | 1-2 phút |
| 3 | Cài Frontend dependencies | 2-3 phút |
| 4 | Tạo Python venv | < 1 phút |
| 5 | Cài ML dependencies | 1-2 phút |
| 6 | Xử lý dữ liệu (preprocessing) | 1-2 phút |
| 7 | Train Decision Tree model | 1-3 phút |
| 8 | Khởi chạy 3 services | < 1 phút |

**⏱️ Tổng cộng: ~10-20 phút**

### BƯỚC 3: Lần Chạy Tiếp Theo

Chỉ cần:

```cmd
start-all.bat
```

**Sẽ mở 3 cửa sổ terminal:**
- ✅ Backend (NestJS) - port 3001
- ✅ Frontend (React) - port 3000
- ✅ ML API (Flask) - port 5000

**⏱️ Thời gian: ~2-3 phút**

### BƯỚC 4: Truy Cập

Mở browser:
```
http://localhost:3000
```

Bạn sẽ thấy Dashboard của hệ thống! 🎉

---

## 🔧 CHẠY TỪNG SERVICE RIÊNG LẺ (Advanced)

Nếu bạn chỉ muốn chạy 1 service:

### Backend Riêng
```bash
cd backend-nestjs
npm install
npm run start:dev
```
✅ Backend chạy tại http://localhost:3001

### Frontend Riêng
```bash
cd frontend-react
npm install
npm start
```
✅ Frontend chạy tại http://localhost:3000

### ML API Riêng
```bash
cd ml-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python predict_api.py
```
✅ ML API chạy tại http://localhost:5000

⚠️ **Lưu ý:** Frontend cần Backend + ML API chạy để hoạt động đầy đủ

---

## 📊 TÍNH NĂNG CHÍNH

### 🏠 Dashboard
- 📈 Tổng quát số khách hàng
- 📊 Thống kê churn rate
- 📉 Biểu đồ phân tích xu hướng

### 👥 Quản Lý Khách Hàng
- 📋 Danh sách khách hàng (có phân trang)
- 🔍 Tìm kiếm khách hàng
- 📥 Import CSV khách hàng mới
- ➕ Tạo khách hàng mới
- 🔮 Dự đoán churn cho từng khách

### 🔮 Dự Đoán ✨ **CẬP NHẬT**
- **2 Loại Form:**
  - **Form Nhanh** (8 fields): Nhập nhanh dữ liệu cơ bản
  - **Form Đầy Đủ** (19 fields): Nhập chi tiết tất cả thông tin
- 🔘 **Toggle Form**: Dễ dàng chuyển đổi giữa 2 form theo nhu cầu
- 👤 **Customer ID Display**: Hiển thị thông tin khách hàng trong kết quả
- 📜 **History**: Xem lịch sử dự đoán
- 🗑️ **Delete**: Xóa dự đoán instantly

### 🎯 What-If Simulation
- 🔧 Thay đổi các thuộc tính khách hàng (tenure, charges, contract...)
- 📊 Xem churn probability thay đổi real-time
- 🔄 So sánh kịch bản base vs modified
- 💡 Giúp tìm ra action tối ưu để giữ khách

---

## 🌳 MODEL: Decision Tree

**Tại sao Decision Tree?**
- ✅ Nhanh - Real-time prediction
- ✅ Dễ giải thích - Feature importance rõ ràng
- ✅ Không cần retrain thường xuyên
- ✅ Hiệu năng tốt (~82% accuracy)

**Hiệu Năng:**
- Test Accuracy: ~82%
- F1 Score: ~78%
- Cross-validation: Ổn định

---

## 🧪 KIỂM TRA CÁC SERVICES

### ✅ Frontend
```
http://localhost:3000
```
Nên thấy Dashboard

### ✅ Backend
```
http://localhost:3001/api
```
Nên thấy JSON response

### ✅ ML API
```
http://localhost:5000/health
```
Nên thấy health check response

---

## ❌ KHẮC PHỤC SỰ CỐ

| Vấn đề | Nguyên nhân | Giải pháp |
|-------|-----------|----------|
| "Node.js is not installed" | Node.js chưa cài | Tải từ https://nodejs.org/ |
| "Python is not installed" | Python chưa cài | Tải từ https://www.python.org/ (chọn "Add Python to PATH") |
| "Cannot connect to MongoDB" | Connection URI sai hoặc MongoDB chưa chạy | Kiểm tra `.env` / MongoDB service / IP whitelist (MongoDB Atlas) |
| "Port 3000/3001/5000 already in use" | Ứng dụng khác dùng port | Đóng ứng dụng khác hoặc thay port trong `.env` |
| "ML API not found" | ML API chưa chạy | Chạy: `python predict_api.py` ở folder `ml-python/` |
| "Module not found" (Python) | Dependencies chưa cài | `cd ml-python && venv\Scripts\activate && pip install -r requirements.txt` |
| Frontend không load dữ liệu | Backend chưa chạy hoặc MongoDB trống | Kiểm tra Backend chạy: http://localhost:3001/api |

---

## 📁 CẤU TRÚC CUỐI CÙNG SAU SETUP

```
DSS_Project/
├── backend-nestjs/
│   ├── src/              # ✅ Source code
│   ├── dist/             # ✅ Build output (auto-generated)
│   ├── node_modules/     # ✅ Dependencies (auto-generated)
│   └── .env              # ✅ Config (auto-generated)
│
├── frontend-react/
│   ├── src/              # ✅ Source code
│   ├── build/            # ✅ Build output (khi chạy npm build)
│   ├── node_modules/     # ✅ Dependencies (auto-generated)
│   └── .env.local        # ✅ Config
│
├── ml-python/
│   ├── venv/             # ✅ Virtual environment (auto-generated)
│   ├── model.pkl         # ✅ Trained model (auto-generated)
│   ├── scaler.pkl        # ✅ Data scaler (auto-generated)
│   ├── label_encoders.pkl # ✅ Encoders (auto-generated)
│   ├── clean_dataset.csv  # ✅ Cleaned data (auto-generated)
│   ├── evaluation_results/ # ✅ Model reports (auto-generated)
│   └── *.py              # ✅ Source code
│
└── WA_Fn-UseC_-Telco-Customer-Churn.csv  # ✅ Training data
```

---

## 📝 GHI CHÚ QUAN TRỌNG

### 🕐 Thời Gian Khởi Động

- **Lần đầu**: ~10-20 phút (setup + dependencies + training)
- **Lần sau**: ~2-3 phút (chỉ khởi chạy services)

### 🔄 Khi Import CSV Mới

- Model sẽ tự động **retrain** trong lần chạy `start-all.bat` tiếp theo
- Hoặc chạy thủ công ở `ml-python/`:
  ```cmd
  python data_preprocessing.py
  python train_model.py
  ```

### 🗄️ Database

- **MongoDB Cloud**: ✅ Cần Internet, dữ liệu trên server
- **MongoDB Local**: ✅ Không cần Internet, dữ liệu trên máy cục bộ

---

## 📚 DOCUMENTATION CHI TIẾT

Xem thêm chi tiết từng component:
- [Frontend README](frontend-react/README.md) - React code structure & APIs
- [Backend README](backend-nestjs/README.md) - NestJS API endpoints
- [ML README](ml-python/README.md) - Model training & evaluation

---

## 🎯 BƯỚC TIẾP THEO SAU KHI SETUP

1. **Khám phá Dashboard** → Xem tổng quan dữ liệu
2. **Import CSV** → Thêm khách hàng vào hệ thống
3. **Test Prediction** → Dự đoán churn cho từng khách
4. **Try What-If** → Phân tích kịch bản "What-If"
5. **Check Browser DevTools** → F12 để debug nếu cần

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. ✅ Kiểm tra logs trong terminal
2. ✅ Đọc chi tiết từng README (frontend, backend, ml-python)
3. ✅ Đảm bảo Node.js, Python, MongoDB cài đặt đúng
4. ✅ Mở Browser DevTools (F12) → Console tìm error message

---

## 🎉 READY TO GO!

```cmd
setup.bat          # Lần đầu (10-20 phút)
start-all.bat      # Lần sau (2-3 phút)
```

Truy cập: **http://localhost:3000**

**Happy Predicting! 🚀**
