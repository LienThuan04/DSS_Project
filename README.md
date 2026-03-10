# DSS Antigravity - Hệ Thống Hỗ Trợ Quyết Định Dự Đoán Churn Khách Hàng

Hướng dẫn hoàn chỉnh để chạy dự án từ A-Z. Dự án này bao gồm:
- **Backend**: NestJS API trên port 3001
- **Frontend**: React UI trên port 3000  
- **ML API**: Python Flask API trên port 5000
- **Database**: MongoDB (cloud hoặc local)

---

## ⚡ TÓM TẮT NHANH (QUICK START)

**Nếu bạn không muốn đọc nhiều, làm theo 3 bước này:**

### Bước 1️⃣: Tạo file `.env` (1 phút)
Tạo file tên `.env` trong thư mục `backend-nestjs/` với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/DSS2
ML_API_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
```

_Lưu ý: Thay `mongodb://localhost:27017/DSS2` bằng MongoDB URI của bạn (xem BƯỚC 5 dưới)_

### Bước 2️⃣: Đặt file dữ liệu (< 1 phút)
Đảm bảo file `WA_Fn-UseC_-Telco-Customer-Churn.csv` nằm trong **thư mục gốc** của dự án (cùng cấp với `start-all.bat`)

### Bước 3️⃣: Chạy dự án (7-15 phút lần đầu)
**Double-click** file `start-all.bat` trong thư mục gốc

Chờ tất cả terminal mở → Truy cập: **http://localhost:3000**

**Xong!** 🎉

---

## 📖 HƯỚNG DẪN CHI TIẾT (Đọc nếu muốn hiểu rõ)

## 📋 YÊU CẦU HỆ THỐNG

Trước khi bắt đầu, đảm bảo máy của bạn có cài đặt:

### 1. Node.js & npm (cho Backend + Frontend)
- **Tải từ**: https://nodejs.org/
- **Phiên bản tối thiểu**: v14.0.0 trở lên
- **Kiểm tra cài đặt**:
  ```cmd
  node --version
  npm --version
  ```

### 2. Python (cho ML Pipeline)
- **Tải từ**: https://www.python.org/
- **Phiên bản tối thiểu**: Python 3.8 trở lên
- **Kiểm tra cài đặt**:
  ```cmd
  python --version
  ```

### 3. MongoDB (Database)
**Chọn 1 trong 2 tùy chọn:**

**Option A: MongoDB Cloud (Khuyến nghị)**
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Tạo tài khoản miễn phí
3. Tạo cluster mới
4. Lấy connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

**Option B: MongoDB Local**
1. Tải từ: https://www.mongodb.com/try/download/community
2. Cài đặt và chạy dịch vụ
3. Connection string: `mongodb://localhost:27017`

---

## 🚀 BƯỚC 1: CLONE / DOWNLOAD PROJECT

1. **Mở PowerShell hoặc Command Prompt**
2. **Điều hướng đến vị trí muốn lưu code** (ví dụ Desktop):
   ```cmd
   cd Desktop
   ```
3. **Clone project** (nếu dùng Git):
   ```cmd
   git clone <repository-url>
   cd DSS_Antigravity
   ```
   
   Hoặc **download ZIP** từ GitHub → extract → mở folder

4. **Kiểm tra folder có đúng không:**
   ```cmd
   # Bạn nên thấy các thư mục này:
   dir
   # Output sẽ hiển thị:
   # backend-nestjs/
   # frontend-react/
   # ml-python/
   # start-all.bat
   # README.md
   # ...
   ```

---

## � BƯỚC 3: CÀI ĐẶT CÁC THƯ VIỆN (DEPENDENCIES)

### 3.1 Backend NestJS Dependencies

**Thư mục**: Vào thư mục `backend-nestjs`

**Cách 1: Tự động với start-all.bat (Khuyến nghị)**
Khi chạy `start-all.bat`, nó tự động cài tất cả, bạn không cần làm gì cả.

**Cách 2: Cài thủ công**
```cmd
# Mở cmd/PowerShell
# Điều hướng vào thư mục backend-nestjs
cd backend-nestjs

# Cài tất cả dependencies từ package.json
npm install
```

**Các thư viện chính:**
- `@nestjs/core` - Framework NestJS
- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - Database ODM
- `axios` - HTTP client (gễi request đến ML API)

### 3.2 Frontend React Dependencies

**Thư mục**: Vào thư mục `frontend-react`

**Cách 1: Tự động với start-all.bat (Khuyến nghị)**
Khi chạy `start-all.bat`, nó tự động cài tất cả.

**Cách 2: Cài thủ công**
```cmd
# Mở cmd/PowerShell
# Điều hướng vào thư mục frontend-react
cd frontend-react

# Cài tất cả dependencies từ package.json
npm install
```

**Các thư viện chính:**
- `react` - UI framework
- `typescript` - Type checking
- `axios` - HTTP client (gọi Backend API)
- `tailwindcss` - Styling
- `lucide-react` - Icons

### 3.3 ML Python Dependencies

**Thư mục**: Vào thư mục `ml-python`

**Cách 1: Tự động với start-all.bat (Khuyến nghị)**
Khi chạy `start-all.bat`, nó tự động:
1. Tạo Python virtual environment (`venv`)
2. Cài tất cả packages từ `requirements.txt`

**Cách 2: Cài thủ công**
```cmd
# Mở cmd/PowerShell
# Điều hướng vào thư mục ml-python
cd ml-python

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
venv\Scripts\activate

# Cài tất cả dependencies
pip install -r requirements.txt
```

**Các thư viện chính trong requirements.txt:**
- `flask` - Web framework cho ML API
- `pandas` - Data processing
- `scikit-learn` - Machine Learning models
- `joblib` - Save/load models
- `numpy` - Numerical computing

**Lưu ý**: Lần đầu cài Python dependencies sẽ mất 2-3 phút (tải sklearn, pandas...)

---

## 💾 BƯỚC 4: CHUẨN BỊ DỮ LIỆU TRAINING ML

### 4.1 Kiểm tra file dữ liệu

Đảm bảo bạn có file CSV dữ liệu khách hàng:
- Tên file: `WA_Fn-UseC_-Telco-Customer-Churn.csv`
- Đặt vào **thư mục gốc** của dự án (cùng cấp với `start-all.bat`)

**Ví dụ cấu trúc:**
```
DSS_Antigravity/
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  ← File CSV đặt ở đây
├── start-all.bat
├── backend-nestjs/
├── frontend-react/
└── ml-python/
```

### 4.2 Cấu trúc dữ liệu CSV

File CSV phải có các cột sau (dòng header):
```
customerID, gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService, 
MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, 
TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, 
PaymentMethod, MonthlyCharges, TotalCharges, Churn
```

**Lưu ý**: 
- Cột `Churn` phải có giá trị `Yes` hoặc `No`
- Các cột khác phải matching với tên trên

---

## 🛠️ BƯỚC 5: CẤU HÌNH BACKEND (.env File)

Nếu file `.env` chưa tồn tại, hãy tạo file mới với nội dung sau:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DSS2
ML_API_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
```

### 2.2 Cấu hình MongoDB URI

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
