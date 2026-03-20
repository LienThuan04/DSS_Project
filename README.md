# DSS Antigravity - Hệ Thống Hỗ Trợ Quyết Định Churn Prediction

**Customer Churn Prediction System** sử dụng Machine Learning.

Dự đoán những khách hàng có nguy cơ churn (rời khỏi dịch vụ) để có hành động giữ chân kịp thời.

📊 **Tech Stack:**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: NestJS + MongoDB
- **ML**: Python (Decision Tree) + Flask
- **Database**: MongoDB (Local hoặc Cloud Atlas)

---

## ⚡ QUICK START - CHỈ 2 LỆNH

### 🎯 Lần Đầu: Setup

```cmd
setup.bat
```

⏱️ Mất ~10-20 phút (cài dependencies, train model, chạy toàn bộ)

### 🚀 Lần Sau: Chạy

```cmd
start-all.bat
```

⏱️ Mất ~2-3 phút

---

## 📱 Truy Cập

Sau khi khởi động, mở browser:
- **Frontend**: http://localhost:3000 ← **Vào đây**
- Backend API: http://localhost:3001/api
- ML API: http://localhost:5000

---

## ✨ CẬP NHẬT MỚI (Version Latest)

### 🌳 ML Model
- ✅ **Decision Tree only** (tối ưu hóa, nhanh hơn)
- ❌ Loại bỏ Logistic Regression & Random Forest

### 📋 Frontend - Predictions Page
- ✨ **Quick Form** (8 essential fields) - form đơn giản
- 📝 **Full Form** (19 fields) - form đầy đủ
- 🔘 **Toggle button** để chọn giữa hai form
- 👤 **Customer ID display** - hiển thị ID khách hàng
- 🔄 **Delete without modal** - delete dự đoán mà không hiện chi tiết

### 🔧 Backend
- ✅ Tích hợp Decision Tree model
- ✅ Cải thiện recommendation logic
- ✅ Optimized predictions

---

## 📋 YÊU CẦU HỆ THỐNG

**Trước khi bắt đầu, cài đặt:**

1. **Node.js** v14+ (https://nodejs.org/)
2. **Python** 3.8+ (https://www.python.org/)
3. **MongoDB** (Local hoặc Cloud Atlas - miễn phí)

**Kiểm tra:**
```cmd
node --version
npm --version
python --version
```

---

## 🗂️ CẤU TRÚC THƯ MỤC

```
DSS_Antigravity/
├── setup.bat                              # Chạy lần đầu
├── start-all.bat                          # Chạy lần sau
├── README.md                              # File này
│
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  # Data (bạn phải có)
│
├── frontend-react/                        # React UI (port 3000)
│   ├── README.md                         # Frontend hướng dẫn
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.tsx        # Full form
│   │   │   └── SimplePredictionForm.tsx  # ✨ Quick form (NEW)
│   │   └── pages/
│   │       └── Predictions.tsx           # ✨ Form toggle (UPDATED)
│   └── ...
│
├── backend-nestjs/                        # NestJS API (port 3001)
│   ├── README.md                         # Backend hướng dẫn
│   ├── src/
│   │   ├── predictions/
│   │   ├── customers/
│   │   └── common/
│   └── .env (tạo tự động)
│
├── ml-python/                             # Decision Tree + Flask (port 5000)
│   ├── README.md                         # ML hướng dẫn ✨ UPDATED
│   ├── train_model.py                    # ✨ Decision Tree only
│   ├── predict_api.py                    # REST API
│   ├── model.pkl                         # (auto-generated sau train)
│   └── ...
│
└── docs/                                  # Documentation
    └── ...
```

---

## 🚀 CHI TIẾT TỪNG BƯỚC

### BƯỚC 1: Chuẩn Bị Dữ Liệu

Đảm bảo bạn có file: `WA_Fn-UseC_-Telco-Customer-Churn.csv`

Đặt nó vào **thư mục gốc** (cùng với setup.bat)

### BƯỚC 2: Setup (Lần Đầu)

Mở **PowerShell** hoặc **CMD**, điều hướng vào thư mục gốc, chạy:

```cmd
setup.bat
```

Nó sẽ **tự động:**
- ✅ Kiểm tra Node.js, Python
- ✅ Cài Backend dependencies
- ✅ Cài Frontend dependencies
- ✅ Tạo Python venv
- ✅ Cài ML dependencies
- ✅ Chạy data preprocessing
- ✅ ✨ Train Decision Tree model
- ✅ Tự động chạy start-all.bat

### BƯỚC 3: Start Application (Lần Sau)

Chỉ cần:

```cmd
start-all.bat
```

Sẽ mở 3 cửa sổ terminal:
- Backend (port 3001)
- Frontend (port 3000)
- ML API (port 5000)

### BƯỚC 4: Truy Cập

Mở browser:
```
http://localhost:3000
```

Thế là xong! 🎉

---

## 🔧 CẤU HÌNH ENVIRONMENT (Tùy Chọn)

Nếu `setup.bat` không tạo `.env`, tạo thủ công:

### Backend: `backend-nestjs/.env`
```env
MONGODB_URI=mongodb://localhost:27017/DSS2
# hoặc MongoDB Cloud:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/DSS2?retryWrites=true&w=majority

PORT=3001
NODE_ENV=development
ML_API_URL=http://localhost:5000
```

### Frontend: `frontend-react/.env.local`
```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 📊 TÍNH NĂNG CHÍNH

### 🏠 Dashboard
- Tổng quan số khách hàng
- Thống kê churn rate
- Biểu đồ phân tích

### 👥 Customers
- Danh sách khách hàng
- Import CSV mới
- Dự đoán churn

### 🔮 Predictions ✨ **MỚI**
- **Quick Form**: 8 fields, nhập nhanh
- **Full Form**: 19 fields, chi tiết
- **Toggle**: Chọn form theo nhu cầu
- **Customer ID**: Hiển thị chi tiết khách hàng
- **Delete**: Xóa không hiện modal

### 🎯 What-If
- Thay đổi thuộc tính
- Xem churn probability thay đổi
- So sánh kịch bản

---

## 🌳 MODEL: Decision Tree ✨

**Why Decision Tree?**
- ✅ Nhanh (real-time prediction)
- ✅ Dễ giải thích (feature importance)
- ✅ Không cần retrain thường xuyên
- ✅ Hiệu năng tốt

**Hiệu Năng:**
- Test Accuracy: ~82%
- F1 Score: ~78%
- Cross-validation: Ổn định

---

## 🧪 KIỂM TRA HOẠT ĐỘNG

### Frontend
```
http://localhost:3000
```
Nên thấy Dashboard

### Backend
```
http://localhost:3001/api
```
Nên thấy JSON response

### ML API
```
http://localhost:5000/health
```
Nên thấy health check

---

## ❌ CÓ VẤN ĐỀ?

### "Node.js is not installed"
→ Tải từ https://nodejs.org/

### "Python is not installed"
→ Tải từ https://www.python.org/ (chọn "Add Python to PATH")

### "Cannot connect to MongoDB"
→ Kiểm tra:
- MongoDB service chạy chưa?
- MONGODB_URI trong .env đúng không?
- IP whitelist (nếu MongoDB Cloud)?

### "Port already in use"
→ Thay đổi port trong `.env`

### "ML API not found"
→ Chạy: `python ml-python/predict_api.py`

---

## 🔀 CHẠY TỪNG SERVICE RIÊNG (Advanced)

### Backend Only
```bash
cd backend-nestjs
npm run start:dev
```

### Frontend Only
```bash
cd frontend-react
npm start
```

### ML API Only
```bash
cd ml-python
python predict_api.py
```

⚠️ **Lưu ý:** Frontend cần Backend + ML API để hoạt động đầy đủ

---

## 📁 TỪNG THÀNH PHẦN

### Frontend (React) - [chi tiết](frontend-react/README.md)
- Giao diện người dùng
- **Quick/Full Form toggle** ✨
- Real-time predictions
- Chart visualizations

### Backend (NestJS) - [chi tiết](backend-nestjs/README.md)
- REST API
- MongoDB integration
- ML API integration
- Business logic

### ML (Python) - [chi tiết](ml-python/README.md)
- ✨ **Decision Tree classifier**
- Feature engineering
- Model training & evaluation
- Flask REST API

---

## 🎓 ĐỐI VỚI NHẬP CSV

Sau khi app chạy, có thể import CSV tại trang **Customers**:

1. Mở http://localhost:3000/customers
2. Click **"Import CSV"**
3. Chọn file CSV có khách hàng
4. Click Import

Dữ liệu sẽ được lưu vào MongoDB.

---

## 📝 GHI CHÚ

- **Lần chạy đầu**: ~10-20 phút (setup + training)
- **Lần chạy tiếp theo**: ~2-3 phút
- **Model sẽ retrain** khi bạn import CSV mới
- **Không cần cài Docker/Kubernetes** - chạy native

---

## 🔗 RESOURCES

- [Frontend README](frontend-react/README.md) - Details về React app
- [Backend README](backend-nestjs/README.md) - Details về NestJS API
- [ML README](ml-python/README.md) - Details về Decision Tree model
- [API Documentation](docs/API.md) - Chi tiết API endpoints
- [Recommendation Rules](docs/recommendation-rules.md) - Business rules

---

## 📞 SUPPORT

Nếu gặp lỗi:
1. Kiểm tra logs trong terminal
2. Đọc chi tiết trong từng README (frontend, backend, ml-python)
3. Đảm bảo Node.js, Python, MongoDB cài đặt đúng

---

## 🎉 READY TO GO!

```cmd
setup.bat          # Lần đầu (10-20 phút)
start-all.bat      # Lần sau (2-3 phút)
```

Truy cập: http://localhost:3000

**Happy Predicting! 🚀**

---

## 📋 YÊU CẦU HỆ THỐNG

Trước khi chạy, đảm bảo máy có:

### 1️⃣ Node.js & npm
- **Tải**: https://nodejs.org/
- **Phiên bản tối thiểu**: v14.0.0+
- **Kiểm tra**:
  ```cmd
  node --version
  npm --version
  ```

### 2️⃣ Python
- **Tải**: https://www.python.org/
- **Phiên bản tối thiểu**: Python 3.8+
- **Kiểm tra**:
  ```cmd
  python --version
  ```

### 3️⃣ MongoDB
**Chọn 1 trong 2:**

**A. MongoDB Cloud (Khuyến nghị)**
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Tạo account miễn phí
3. Tạo cluster
4. Lấy connection string

**B. MongoDB Local**
1. Tải: https://www.mongodb.com/try/download/community
2. Cài đặt và chạy service
3. Connection string: `mongodb://localhost:27017/DSS2`

---

## � CẤU HÌNH ENVIRONMENT VARIABLES

Sau khi pull dự án về, bạn **CÓ THỂ** cần thiết lập environment variables cho Backend và Frontend.

**Lưu ý:** File `.env` được tạo **tự động** bởi `setup.bat`, nhưng bạn có thể cấu hình tùy chỉnh.

### Backend Environment Setup

File cấu hình: `backend-nestjs/.env`

**Tạo file mới nếu chưa có:**
```bash
# Từ thư mục gốc của dự án
cd backend-nestjs
```

**Nội dung file `.env`:**
```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/DSS2?appName=DSS"
PORT=3001
NODE_ENV=development
ML_API_URL=http://localhost:5000
```

**Chi tiết từng biến:**

| Biến | Mô tả | Ví dụ | Ghi chú |
|------|-------|--------|---------|
| **MONGODB_URI** | Connection string MongoDB | `mongodb://localhost:27017/DSS2` hoặc `mongodb+srv://user:pass@cluster.mongodb.net/DSS2` | **Bắt buộc** - Chỉnh sửa user/password của bạn |
| **PORT** | Port chạy Backend | `3001` | Mặc định 3001 |
| **NODE_ENV** | Môi trường | `development` hoặc `production` | `development` cho local testing |
| **ML_API_URL** | URL của ML API | `http://localhost:5000` | Đảm bảo ML API chạy trên port này |

**Ví dụ MongoDB URI cho các trường hợp:**

**1. MongoDB Local (mặc định):**
```env
MONGODB_URI=mongodb://localhost:27017/DSS2
```

**2. MongoDB Cloud (Atlas) - Khuyên dùng:**
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/DSS2?retryWrites=true&w=majority
```
_Thay `your_username` và `your_password` bằng thông tin tài khoản MongoDB Atlas của bạn_

**3. MongoDB Running on Different Port:**
```env
MONGODB_URI=mongodb://localhost:27018/DSS2
```

---

### Frontend Environment Setup

File cấu hình: `frontend-react/.env.local`

**Tạo file mới nếu chưa có:**
```bash
# Từ thư mục gốc của dự án
cd frontend-react
```

**Nội dung file `.env.local`:**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

**Chi tiết từng biến:**

| Biến | Mô tả | Ví dụ | Ghi chú |
|------|-------|--------|---------|
| **REACT_APP_API_URL** | URL Backend API | `http://localhost:3001/api` | Phải kết thúc bằng `/api` |

**Ví dụ cho các trường hợp:**

**1. Local Development (mặc định):**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

**2. Backend trên máy khác:**
```env
REACT_APP_API_URL=http://192.168.1.100:3001/api
```

**3. Production (Deployed Backend):**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

### ML Python Setup

Nơi đặt dữ liệu training: `WA_Fn-UseC_-Telco-Customer-Churn.csv`

**Không cần file `.env` cho ML API**, nhưng kiểm tra:**
- File dữ liệu CSV ở thư mục gốc: `DSS_Antigravity/WA_Fn-UseC_-Telco-Customer-Churn.csv`
- Python 3.8+ đã cài
- Virtual environment sẽ được tạo tự động bởi `setup.bat`

---

### ⚡ Nhanh Chóng: Auto-Setup

Lần chạy đầu tiên, `setup.bat` sẽ **tự động tạo** các file `.env`:

```
setup.bat
  ↓
  ├─ Kiểm tra Backend .env → Tạo nếu chưa có
  ├─ Kiểm tra Frontend .env.local → Tạo nếu chưa có
  ├─ Tạo Python venv
  ├─ Cài đặt dependencies
  └─ Chạy setup.bat tự động
```

**Sau đó, chỉ cần chạy:**
```cmd
start-all.bat
```

---

### 🔍 Kiểm Tra Cấu Hình

Sau khi tạo file `.env`, kiểm tra:

**Backend:**
```bash
# Kiểm tra file tồn tại
ls -la backend-nestjs/.env

# Hoặc trên Windows:
dir backend-nestjs\.env
```

**Frontend:**
```bash
# Kiểm tra file tồn tại
ls -la frontend-react/.env.local

# Hoặc trên Windows:
dir frontend-react\.env.local
```

---

### ⚠️ Lỗi Thường Gặp Với Environment Variables

**Lỗi 1: "Cannot connect to MongoDB"**
```
❌ MONGODB_URI sai
✅ Kiểm tra:
   - User/password đúng?
   - Cluster name đúng?
   - IP whitelist cho phép? (MongoDB Atlas → Security → Network Access)
   - Nếu local, MongoDB service đã chạy? (mongod)
```

**Lỗi 2: "Failed to connect API at http://localhost:3001/api"**
```
❌ REACT_APP_API_URL sai hoặc Backend chưa chạy
✅ Kiểm tra:
   - Backend đã chạy? (npm run start:dev ở backend-nestjs/)
   - Port 3001 có thể truy cập?
   - Thay thế localhost bằng 127.0.0.1 nếu cần
```

**Lỗi 3: "ML API not found"**
```
❌ ML_API_URL sai hoặc ML API chưa chạy
✅ Kiểm tra:
   - ML API đã chạy? (python predict_api.py ở ml-python/)
   - Port 5000 còn trống?
   - Firewall cho phép kết nối?
```

**Lỗi 4: ".env file không được tạo"**
```
❌ setup.bat không có quyền ghi
✅ Giải pháp:
   - Chạy PowerShell/CMD dưới quyền Admin
   - Hoặc tạo file thủ công bằng text editor
   - Copy nội dung từ phần hướng dẫn ở trên
```

---

## �📂 Cấu Trúc Thư Mục

```
DSS_Antigravity/
├── setup.bat                          ← Chạy lần đầu
├── start-all.bat                      ← Chạy từ lần 2 trở đi
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  ← File dữ liệu training
├── backend-nestjs/                    ← Backend source code
├── frontend-react/                    ← Frontend source code
├── ml-python/                         ← ML model code
└── docs/                              ← Documentation
```

---

## ⚙️ Cấu Hình Backend (.env)

File `.env` sẽ được tạo **tự động** bởi `setup.bat` ở đường dẫn: `backend-nestjs/.env`

Nếu cần chỉnh sửa, mở file `backend-nestjs/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/DSS2
ML_API_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
```

**Với MongoDB Cloud, thay thế:**
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/DSS2?retryWrites=true&w=majority
```

---

## 📊 Dữ Liệu Training

File dữ liệu CSV phải:
- **Tên file**: `WA_Fn-UseC_-Telco-Customer-Churn.csv`
- **Vị trí**: Thư mục **gốc** dự án (cùng với `setup.bat`)

**Dữ liệu ML:**
- Được xử lý tự động bởi `ml-python/data_preprocessing.py`
- Model được train bởi `ml-python/train_model.py`
- Model được lưu tại: `ml-python/model.pkl`

---

## 🛑 Khắc Phục Sự Cố

### Lỗi: "Node.js is not installed"
→ Cài Node.js từ https://nodejs.org/

### Lỗi: "Python is not installed"
→ Cài Python từ https://www.python.org/

### Lỗi: MongoDB connection error
→ Kiểm tra:
- MongoDB đã chạy?
- MONGODB_URI trong `.env` đúng chưa?

### Lỗi: Port already in use
→ Có service khác dùng port. Đóng ứng dụng khác hoặc thay đổi port trong `.env`

---

## 📖 Tài Liệu Chi Tiết

Xem thêm tài liệu đầy đủ:
- [API Documentation](./docs/API.md)
- [Tư Duy Quy Tắc Khuyến Nghị](./docs/recommendation-rules.md)
- [Giải Thích Model](./docs/BE-03-Implementation.md)

---

## 🎯 Tóm Tắt Quy Trình

```
Lần đầu:
  1. setup.bat → cài đặt + train model → tự chạy start-all.bat

Lần sau:
  1. start-all.bat → khởi chạy 3 services
  2. Truy cập http://localhost:3000
  3. Done! 🎉
```

---

## 📧 Support

Nếu gặp vấn đề, kiểm tra:
1. Node.js, Python, MongoDB đã cài chưa?
2. File dữ liệu CSV tồn tại chưa?
3. Chạy `setup.bat` từ thư mục gốc chưa?
4. Xem console output để tìm lỗi cụ thể

**Nếu dùng MongoDB Cloud:**
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/DSS2?retryWrites=true&w=majority
```

**Nếu dùng MongoDB Local:**
```
MONGODB_URI=mongodb://localhost:27017/DSS2
```

---

## 💾 BƯỚC 3: CHUẨN BỊ DỮ LIỆU TRAINING ML

### 3.1 Kiểm tra file dữ liệu

Đảm bảo bạn có file:
- `WA_Fn-UseC_-Telco-Customer-Churn.csv` - File CSV chứa dữ liệu khách hàng

Đặt file này vào thư mục **gốc** của dự án: `DSS_Antigravity/`

### 3.2 Cấu trúc dữ liệu

File CSV phải có các cột sau:
```
customerID, gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService, 
MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, 
TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, 
PaymentMethod, MonthlyCharges, TotalCharges, Churn
```

---

## ⚡ BƯỚC 6: CHẠY DỰ ÁN (CÁCH ĐƠN GIẢN NHẤT)

### 6.1 Chạy file start-all.bat (Windows)

**Cách 1: Click trực tiếp (Dễ nhất)**
1. Mở Windows Explorer
2. Điều hướng vào **thư mục gốc dự án** nơi có file `start-all.bat`
3. **Double-click** file `start-all.bat`
4. Chờ các cửa sổ terminal mở (sẽ có 3 cửa sổ: Backend, Frontend, ML API)

**Cách 2: Từ PowerShell/CMD**
```cmd
# Giả sử bạn ở Desktop/DSS_Antigravity
.\start-all.bat

# Hoặc nếu không chạy được lệnh trên:
cmd /c start-all.bat
```

### 6.2 Quá trình khởi động tự động

Khi chạy `start-all.bat`, nó sẽ **tự động** thực hiện từng bước (bạn không cần làm gì):

| Bước | Việc làm | Thời gian |
|------|----------|----------|
| ✅ 1 | Cài Backend dependencies (npm install) | 1-2 phút |
| ✅ 2 | Cài Frontend dependencies (npm install) | 2-3 phút |
| ✅ 3 | Tạo Python venv + cài pip packages | 1-2 phút |
| ✅ 4 | Retrain ML model (`data_preprocessing.py` + `train_model.py`) | 2-5 phút |
| ✅ 5 | Khởi động ML API server (port 5000) | < 1 phút |
| ✅ 6 | Khởi động Backend NestJS (port 3001) | < 1 phút |
| ✅ 7 | Khởi động Frontend React (port 3000) | < 1 phút |

**⏱️ Tổng thời gian lần đầu: 7-15 phút** (tùy tốc độ mạng & máy)

---

## 🌐 BƯỚC 7: TRUY CẬP ỨNG DỤNG

Sau khi tất cả services khởi động (bạn sẽ thấy trong terminal):
- `[3/3] ML API on port 5000`
- Backend starting...
- Frontend starting...

Mở browser và truy cập:

| Địa chỉ | Mục đích |
|---------|---------|
| http://localhost:3000 | **Chính**: Giao diện chính của ứng dụng |
| http://localhost:3001/api | Backend API endpoint |
| http://localhost:5000/health | Kiểm tra ML API hoạt động |

**Các page có sẵn:**
- **Dashboard** (http://localhost:3000) - Tổng quan
- **Customers** - Quản lý khách hàng
- **Predictions** - Lịch sử dự đoán
- **What-If** - Phân tích kịch bản

---

## 📊 BƯỚC 8: IMPORT DỮ LIỆU KHÁCH HÀNG

### 8.1 Upload file CSV vào ứng dụng

1. Truy cập trang **Customers**: http://localhost:3000/customers
2. Tìm nút **"Import CSV"** (góc trên phải)
3. Chọn file `WA_Fn-UseC_-Telco-Customer-Churn.csv` từ máy
4. Kệu kết quả (xem số hàng imported)
5. Dữ liệu sẽ được lưu vào MongoDB

### 8.2 Xác nhận dữ liệu được import

- Trang Customers sẽ hiển thị danh sách khách hàng
- Nếu không thấy, kiểm tra MongoDB connection

---

## 🔧 BƯỚC 9: CHẠY TỪNG SERVICE RIÊNG LẺ (Tùy chọn)

## 🔧 BƯỚC 9: CHẠY TỪNG SERVICE RIÊNG LẺ (Tùy chọn)

Nếu bạn muốn chỉ chạy 1 service thay vì tất cả, làm như sau:

### 9.1. Chạy Backend riêng
```cmd
# Điều hướng vào thư mục backend
cd backend-nestjs

# Cài dependencies (nếu chưa cài)
npm install

# Chạy server
npm run start:dev
```
Backend sẽ chạy tại http://localhost:3001/api

### 9.2. Chạy Frontend riêng
```cmd
# Điều hướng vào thư mục frontend
cd frontend-react

# Cài dependencies (nếu chưa cài)
npm install

# Chạy server
npm start
```
Frontend sẽ chạy tại http://localhost:3000

**Lưu ý:** Frontend cần Backend + ML API chạy để hoạt động đầy đủ

### 9.3. Chạy ML API riêng

**Step 1: Chuẩn bị Python environment**
```cmd
# Điều hướng vào thư mục ml-python
cd ml-python

# Tạo virtual environment (nếu chưa có)
python -m venv venv

# Kích hoạt virtual environment
venv\Scripts\activate
```

**Step 2: Cài dependencies**
```cmd
# Install from requirements.txt
pip install -r requirements.txt
```

**Step 3: Retrain model (chỉ lần đầu hoặc khi dữ liệu thay đổi)**
```cmd
# Preprocess dữ liệu từ CSV
python data_preprocessing.py

# Train model
python train_model.py
```

**Step 4: Chạy ML API**
```cmd
# Khởi động Flask API server
python predict_api.py
```
ML API sẽ chạy tại http://localhost:5000

---

## 💡 BƯỚC 10: KIỂM TRA CÁC SERVICES CHẠY ĐÚNG

### Kiểm tra Frontend
```
http://localhost:3000
```
- Bạn nên thấy giao diện trang Dashboard

### Kiểm tra Backend
```
http://localhost:3001/api
```
- Nếu thấy JSON response → Backend chạy OK

### Kiểm tra ML API
```
http://localhost:5000/health
```
- Nếu thấy response → ML API chạy OK

---

### Lỗi: "Node.js is not installed"
**Giải pháp:**
1. Tải Node.js từ https://nodejs.org/
2. Cài đặt và restart máy
3. Chạy lại `start-all.bat`

### Lỗi: "Python is not installed"
**Giải pháp:**
1. Tải Python từ https://www.python.org/
2. **Lưu ý**: Chọn "Add Python to PATH" khi cài đặt
3. Restart PowerShell/CMD sau cài đặt
4. Chạy lại `start-all.bat`

### Lỗi: "Cannot connect to MongoDB"
**Giải pháp:**
1. Kiểm tra `.env` file - đảm bảo `MONGODB_URI` đúng
2. Nếu dùng MongoDB Cloud:
   - Kiểm tra tên user/password
   - Kiểm tra IP whitelist (cho phép tất cả IP: 0.0.0.0/0)
   - Kiểm tra username/password không có ký tự đặc biệt
3. Nếu dùng MongoDB Local:
   - Đảm bảo MongoDB service đang chạy
   - Chạy `mongod` để khởi động service

### Lỗi: "Port 3000/3001/5000 already in use"
**Giải pháp:**
1. **Cách 1**: Đóng ứng dụng khác đang dùng port đó
2. **Cách 2**: Thay đổi port trong file cấu hình:
   - Backend: Chỉnh `PORT` trong `.env`
   - Frontend: Chỉnh biến `PORT` khi chạy
   - ML API: Chỉnh port trong `predict_api.py` (mặc định 5000)

### Lỗi: "Module not found" (Python)
**Giải pháp:**
```cmd
cd DSS_Antigravity/ml-python
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend không load được dữ liệu
**Giải pháp:**
1. Kiểm tra Backend đang chạy: http://localhost:3001/api
2. Kiểm tra MongoDB có dữ liệu không
3. Mở Browser DevTools (F12) → Console tab → xem error message
4. Kiểm tra lại `MONGODB_URI` trong `.env`

### ML Model predictions không chính xác
**Giải pháp:**
1. Đảm bảo file dữ liệu CSV đúng path
2. Model sẽ tự động retrain khi chạy `start-all.bat`
3. Đợi ML training hoàn thành (xem terminal window có dòng "✓ Model training completed")

---

## 📁 CẤU TRÚC THƯ MỤC

## 📁 CẤU TRÚC CUỐI CÙNG SAU KHI CHẠY THÀNH CÔNG

```
DSS_Antigravity/
├── backend-nestjs/                              # Backend NestJS
│   ├── src/                                    # Source code
│   ├── node_modules/                           # Dependencies (tạo sau npm install)
│   ├── .env                                    # Cấu hình (bạn tạo)
│   ├── package.json                            # Dependencies list
│   └── tsconfig.json                           # TypeScript config
│
├── frontend-react/                              # Frontend React
│   ├── src/                                    # Source code
│   ├── node_modules/                           # Dependencies (tạo sau npm install)
│   ├── package.json                            # Dependencies list
│   ├── public/                                 # Static files
│   └── tsconfig.json                           # TypeScript config
│
├── ml-python/                                   # ML Pipeline
│   ├── venv/                                   # Virtual environment (tạo tự động)
│   ├── data_preprocessing.py                   # Data cleaning script
│   ├── train_model.py                          # Model training script
│   ├── predict_api.py                          # ML API server
│   ├── model.pkl                               # Saved model (tạo sau train)
│   ├── scaler.pkl                              # Scaler (tạo sau train)
│   ├── label_encoders.pkl                      # Encoders (tạo sau train)
│   ├── clean_dataset.csv                       # Cleaned data (tạo sau preprocess)
│   ├── requirements.txt                        # Python dependencies
│   └── evaluation_results/                     # Model evaluation reports
│
├── WA_Fn-UseC_-Telco-Customer-Churn.csv       # Data file (bạn đặt ở đây)
├── start-all.bat                               # Script khởi động toàn bộ
├── README.md                                   # File hướng dẫn này
└── ... (các file khác)
```

**Các file được tạo tự động sau lần chạy đầu:**
- ✅ `backend-nestjs/node_modules/` - Dependencies Node.js
- ✅ `frontend-react/node_modules/` - Dependencies React
- ✅ `ml-python/venv/` - Python virtual environment
- ✅ `ml-python/model.pkl` - Trained model
- ✅ `ml-python/scaler.pkl` - Data scaler
- ✅ `ml-python/clean_dataset.csv` - Cleaned training data
- ✅ `backend-nestjs/.env` - Backend config (tự động tạo nếu không có)

---

---

## ✨ TÍNH NĂNG CHÍNH

### 📊 Dashboard
- Tổng quan số lượng khách hàng
- Thống kê churn rate
- Biểu đồ phân tích

### 👥 Quản lý Khách hàng
- Danh sách tất cả khách hàng
- Import CSV khách hàng mới
- Dự đoán churn cho từng khách

### 🔮 Dự Đoán (Predictions)
- Nhập dữ liệu khách hàng → dự đoán churn probability
- Xem lịch sử dự đoán
- Xem chi tiết từng dự đoán (risk level, recommendation)

### 🎯 What-If Simulation
- Thay đổi các thuộc tính khách hàng (tenure, charges, contract...)
- Xem churn probability thay đổi như thế nào
- So sánh kịch bản base vs modified

---

## 🤝 HỖ TRỢ & LỖI

Nếu gặp lỗi:
1. **Kiểm tra logs** trong các cửa sổ terminal
2. **Mở Browser DevTools** (F12) → Console → xem error
3. **Kiểm tra file `.env`** → đảm bảo URI đúng
4. **Restart dịch vụ** → đóng và chạy lại `start-all.bat`

---

---

## 📝 GHI CHÚ QUAN TRỌNG

### 🕐 Thời gian khởi động

**Lần chạy đầu tiên:**
- ⏱️ Sẽ mất **7-15 phút** (phụ thuộc vào tốc độ mạng & máy)
- 💾 Model ML sẽ được train tự động từ CSV data
- 🍵 Hãy chờ đợi - không bao gồm bạn đóng cửa sổ terminal

**Lần chạy tiếp theo:**
- ⏱️ Khoảng **2-3 phút** (nhanh hơn vì không cần cài dependencies)
- 🔄 Model sẽ được retrain nếu dữ liệu thay đổi

### 📊 Khi import CSV mới

Nếu bạn import CSV khách hàng mới:
1. Model sẽ tự động **retrain** khi chạy `start-all.bat` lần tiếp theo
2. Hoặc chạy thủ công trong `ml-python/`:
   ```cmd
   python data_preprocessing.py
   python train_model.py
   ```

### 🗄️ Database (MongoDB)

**Nếu dùng MongoDB Cloud:**
- ✅ Cần Internet để kết nối
- ✅ Dữ liệu được lưu trên server MongoDB
- ✅ Có thể truy cập từ bất kỳ máy nào

**Nếu dùng MongoDB Local:**
- ✅ Không cần Internet
- ✅ Dữ liệu được lưu trên máy cục bộ
- ⚠️ Phải cài MongoDB trước

---

## 🎓 BƯỚC 12: HƯỚNG TIẾP THEO SAU KHI CHẠY THÀNH CÔNG

1. **Khám phá Dashboard** → Xem tổng quan dữ liệu & thống kê
2. **Import Customer CSV** → Thêm dữ liệu khách hàng vào hệ thống
3. **Test Prediction** → Dự đoán churn cho từng khách hàng
4. **Try What-If** → Phân tích các kịch bản "What-If"
5. **Check Backend Logs** → Mở DevTools (F12) để xem chi tiết

---

## 📁 CẤU TRÚC THƯ MỤC CUỐI CÙNG

---

## 📧 Liên hệ & Phản hồi

Nếu có vấn đề hoặc góp ý, vui lòng tạo Issue hoặc liên hệ team phát triển.

---

**Happy coding! 🚀**
