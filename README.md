# Backend - NestJS + MongoDB + Tích Hợp ML

Backend API RESTful cho **Hệ Thống Hỗ Trợ Quyết Định Churn Khách Hàng**.

Xây dựng với:
- 🏗️ NestJS (Framework Node.js)
- 🗄️ MongoDB (Cơ sở dữ liệu)
- 🔌 Kiến trúc Microservice
- 🔗 Tích hợp với ML API (Python Flask)

---

## 📋 Cấu Trúc Thư Mục

```
src/
  ├── main.ts                              # Điểm vào
  ├── app.module.ts                        # Module gốc
  ├── app.controller.ts                    # Controller gốc
  ├── app.service.ts                      # Dịch vụ gốc
  │
  ├── common/
  │   └── services/
  │       ├── ml.service.ts               # Tích hợp ML API
  │       ├── recommendation.service.ts   # Logic khuyến nghị
  │       └── validation.service.ts       # Quy tắc xác thực
  │
  ├── customers/
  │   ├── customers.controller.ts         # Điểm cuối khách hàng
  │   ├── customers.service.ts            # Logic khách hàng
  │   ├── customers.module.ts             # Module khách hàng
  │   ├── dto/
  │   │   └── create-customer.dto.ts      # DTO tạo khách hàng
  │   └── schemas/
  │       └── customer.schema.ts          # Lược đồ MongoDB
  │
  └── predictions/
      ├── predictions.controller.ts       # Điểm cuối dự đoán
      ├── predictions.service.ts          # Logic dự đoán
      ├── predictions.module.ts           # Module dự đoán
      ├── dto/
      │   ├── create-prediction.dto.ts
      │   ├── prediction-response.dto.ts
      │   └── what-if-request.dto.ts
      └── schemas/
          └── prediction.schema.ts
```

---

## 🚀 Cách Chạy

### 1. Cài Dependencies

```bash
cd backend-nestjs
npm install
# hoặc
pnpm install
```

### 2. Cài Đặt Biến Môi Trường

Tạo file `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/DSS2
# hoặc MongoDB Cloud:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DSS2?retryWrites=true&w=majority

# Server
PORT=3001
NODE_ENV=development

# ML API
ML_API_URL=http://localhost:5000
```

### 3. Chạy Máy Chủ Phát Triển

```bash
npm run start:dev
# hoặc
pnpm start:dev
```

Backend sẽ chạy tại: **http://localhost:3001**

### 4. Chạy Sản Xuất

```bash
npm run build
npm run start:prod
```

---

## 📡 API Endpoints

### Customers
- `GET /api/customers` - Danh sách khách hàng (có pagination)
- `GET /api/customers/:id` - Chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng
- `POST /api/customers/import` - Import CSV

### Predictions
- `POST /api/predictions` - Tạo dự đoán mới
- `POST /api/predictions/raw` - Dự đoán dữ liệu thô (raw)
- `GET /api/predictions` - Danh sách dự đoán (có filter theo risk level)
- `GET /api/predictions/:id` - Chi tiết dự đoán
- `DELETE /api/predictions/:id` - Xóa dự đoán
- `GET /api/predictions/stats` - Thống kê (total, high risk, medium, low)

---

## 🔌 Quy Trình Hoạt Động Sơ Bộ

### Flow Dự Đoán

```
Frontend (PredictionForm)
    ↓ POST /api/predictions/raw
    ↓
Backend (predictions.service.ts)
    ↓ gọi ML.service
    ↓
ML API (Python Flask, cổng 5000)
    ↓ Huấn luyện model & dự đoán
    ↓ Trả về: {churnProbability, riskLevel, topFactors}
    ↓
Backend xử lý + lưu MongoDB
    ↓
Phản hồi trả về Frontend
    ↓
Frontend (PredictionResultCard) hiển thị kết quả ✨
```

### Hoạt Động Tích Hợp ML

File: `src/common/services/ml.service.ts`

```typescript
async predictChurn(customerData) {
  // 1. Gọi Python ML API POST /predict
  // 2. Nhận response: {churnProbability, riskLevel, recommendation, topFactors}
  // 3. Trả về kết quả
}
```

### Hoạt Động Khuyến Nghị

File: `src/common/services/recommendation.service.ts`

```typescript
generateRecommendation(riskLevel, churnProbability) {
  // Dựa vào risk level và churn probability
  // Tạo khuyến nghị hành động cho kinh doanh
  // Ví dụ:
  //   - HIGH risk → "Liên hệ ngay, cung cấp chiết khấu giữ chân"
  //   - MEDIUM risk → "Lên kế hoạch cuộc gọi theo dõi"
  //   - LOW risk → "Liên tục giám sát hàng quý"
}
```

---

## 🗄️ Lược Đồ MongoDB

### Lược Đồ Khách Hàng
```typescript
{
  _id: ObjectId,
  customerID: string,
  gender: string,
  SeniorCitizen: number (0|1),
  Partner: string (Yes|No),
  // ... (tất cả 19 features từ model ML)
  createdAt: Date,
  updatedAt: Date
}
```

### Lược Đồ Dự Đoán
```typescript
{
  _id: ObjectId,
  customerId: string,
  customerName: string,
  churnProbability: number (0-1),
  riskLevel: string (LOW|MEDIUM|HIGH),
  recommendation: string,
  priority: string (NORMAL|HIGH|URGENT),
  topFactors: [{feature, value, impact}],
  inputData: object (dữ liệu input đã gửi),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Tích Hợp ML API

Backend tự động gọi ML API (Python Flask) trên cổng 5000.

**Yêu cầu:** ML API phải chạy trước khi backend chạy dự đoán.

```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: ML API
cd ml-python
python predict_api.py
```

---

## 🧪 Kiểm Tra

### Kiểm tra Backend hoạt động

```bash
curl http://localhost:3001/api/predictions/stats
```

Phải nhận được phản hồi JSON như:
```json
{
  "totalPredictions": 5,
  "highRisk": 2,
  "mediumRisk": 2,
  "lowRisk": 1
}
```

### Kiểm tra Tích Hợp ML

Gửi yêu cầu kiểm tra:
```bash
curl -X POST http://localhost:3001/api/predictions/raw \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Male",
    "tenure": 12,
    "MonthlyCharges": 65,
    ...
  }'
```

---

## 📦 Gói Phụ Thuộc Chính

| Gói | Mục Đích |
|---------|---------|
| **@nestjs/core** | Lõi NestJS |
| **@nestjs/mongoose** | ODM MongoDB |
| **mongoose** | Trình điều khiển cơ sở dữ liệu |
| **axios** | Khách hàng HTTP (gọi ML API) |
| **class-validator** | Xác thực DTO |
| **typescript** | An toàn kiểu |

---

## 🐛 Khắc Phục Sự Cố

### Lỗi: "Cannot connect to MongoDB"
```
❌ MONGODB_URI sai hoặc MongoDB không chạy
✅ Kiểm tra:
   - MongoDB service chạy chưa? (mongod hoặc Docker)
   - Chuỗi kết nối đúng không?
   - Danh sách IP whitelist (nếu dùng MongoDB Cloud)?
```

### Lỗi: "ML API not found"
```
❌ ML API không chạy hoặc URL sai
✅ Giải pháp:
   - Chạy ML API: python ml-python/predict_api.py
   - Kiểm tra ML_API_URL=http://localhost:5000
```

### Lỗi: "Port 3001 already in use"
```
✅ Thay đổi PORT trong .env
   PORT=3002
```

---

## 📝 Nhật Ký & Gỡ Lỗi

Nhật ký phát triển sẽ in ra terminal:
```
[Nest] 1234  - 03/20/2026, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1234  - 03/20/2026, 10:30:46 AM     LOG [InstanceLoader] PredictionsModule dependencies initialized
```

---

## 🚀 Triển Khai

### Xây Dựng Sản Xuất
```bash
npm run build
npm start:prod
```

### Docker (Tùy Chọn)
Viết Dockerfile để đóng gói backend (nếu cần)

---

## 🔀 Biến Môi Trường

| Biến | Mặc Định | Mô Tả |
|------|---------|-------|
| **MONGODB_URI** | localhost:27017 | Chuỗi kết nối MongoDB |
| **PORT** | 3001 | Cổng máy chủ |
| **NODE_ENV** | development | Môi trường (dev/prod) |
| **ML_API_URL** | http://localhost:5000 | URL ML API |

---

## 📞 Hỗ Trợ

Nếu gặp lỗi:
1. Kiểm tra nhật ký trong terminal
2. Kiểm tra cấu hình `.env`
3. Đảm bảo MongoDB và ML API chạy

---

**Xây dựng với ❤️ sử dụng NestJS**
