# Frontend - Giao Diện React + TypeScript + Tailwind CSS

Giao diện người dùng hiện đại cho **Hệ Thống Hỗ Trợ Quyết Định Churn Khách Hàng**.

Xây dựng với:
- ⚛️ React 18+ kèm TypeScript
- 🎨 Tailwind CSS để tạo style
- 📊 Recharts để vẽ biểu đồ
- 🔗 Axios để gọi API

---

## 📋 Cấu Trúc Thư Mục

```
src/
  ├── App.tsx                     # Ứng dụng chính
  ├── index.tsx                   # Điểm vào
  ├── index.css                   # Tailwind CSS
  ├── components/
  │   ├── Layout.tsx              # Layout giao diện
  │   ├── PredictionForm.tsx       # Form dự đoán đầy đủ (19 trường)
  │   ├── SimplePredictionForm.tsx # Form dự đoán nhanh (8 trường) ✨ MỚI
  │   ├── PredictionResultCard.tsx # Hiển thị kết quả + ID ✨ CẬP NHẬT
  │   ├── PredictionModal.tsx      # Cửa sổ xem chi tiết
  │   ├── ChurnByContractChart.tsx # Biểu đồ churn theo hợp đồng
  │   └── ...
  ├── pages/
  │   ├── Dashboard.tsx           # Bảng điều khiển
  │   ├── Customers.tsx           # Quản lý khách hàng
  │   ├── Predictions.tsx         # Dự đoán ✨ CẬP NHẬT (toggle form)
  │   └── WhatIfSimulation.tsx    # Phân tích kịch bản
  ├── services/
  │   └── api.ts                  # Kết nối API
  └── types/
      └── index.ts                # Kiểu dữ liệu TypeScript
```

---

## 🚀 Cách Chạy

### 1. Cài Đặt Dependencies

```bash
cd frontend-react
npm install
# hoặc
pnpm install
```

### 2. Cấu Hình Biến Môi Trường

Tạo file `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Chạy Server Phát Triển

```bash
npm start
# hoặc
pnpm start
```

Frontend chạy tại: **http://localhost:3000**

### 4. Build Sản Xuất

```bash
npm run build
# hoặc
pnpm build
```

Output được tạo trong `build/` - có thể triển khai lên server.

---

## ✨ Tính Năng Chính

### 📊 Bảng Điều Khiển
- Thống kê số khách hàng
- Tỷ lệ churn
- Biểu đồ phân tích

### 👥 Quản Lý Khách Hàng
- Danh sách khách hàng (có phân trang)
- Tìm kiếm khách hàng
- Tạo / Xóa khách hàng
- Xem chi tiết

### 🔮 Dự Đoán ✨ **CẬP NHẬT**
- **Chuyển Đổi Form**: Chọn **Form Nhanh** (8 trường) hoặc **Form Đầy Đủ** (19 trường)
- Form Nhanh: Nhập nhanh dữ liệu cơ bản
- Form Đầy Đủ: Nhập chi tiết tất cả trường
- Xem chi tiết dự đoán với **ID Khách Hàng** ✨
- Lịch sử dự đoán có phân trang
- Xóa dự đoán không hiện cửa sổ chi tiết ✨

**Component Form:**
- `PredictionForm.tsx` - Form đầy đủ
- `SimplePredictionForm.tsx` - Form nhanh ✨ MỚI
- Nút chuyển đổi để chọn

### 🎯 Mô Phỏng What-If
- Thay đổi thuộc tính khách hàng
- Xem xác suất churn thay đổi
- So sánh kịch bản khác nhau

---

## 🔌 Tích Hợp API

Tất cả gọi API qua `src/services/api.ts`:

```typescript
export const predictionsApi = {
  list: (page, limit, riskFilter) => {...},
  create: (data) => {...},
  stats: () => {...},
  predictRaw: (customerData) => {...},
  delete: (id) => {...}
}
```

URL Backend từ: `process.env.REACT_APP_API_URL`

---

## 📦 Các Thư Viện Chính

| Thư Viện | Mục Đích |
|----------|---------|
| **react** | Framework giao diện |
| **react-router-dom** | Định tuyến trang |
| **axios** | Gọi HTTP API |
| **recharts** | Vẽ biểu đồ |
| **tailwindcss** | Tạo style |
| **lucide-react** | Icon |
| **typescript** | Kiểm tra kiểu |

---

## 🧪 Mẹo Phát Triển

**Tự động tải lại:** Sửa mã → Browser tự cập nhật (nhờ Dev Server)

**Debug API:** Mở DevTools (F12) → Tab Network → xem gọi API

**Tạo Component:** Tạo file trong `src/components/` → nhập vào pages

---

## 🔗 Liên Kết

- **Backend**: http://localhost:3001/api
- **ML API**: http://localhost:5000
- **Phát Triển**: http://localhost:3000

---

**Xây dựng bằng ❤️ sử dụng React**
- **Recharts** - Data visualization library
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **pnpm** - Package manager (lightweight)

## API Integration

Connects to NestJS backend at `http://localhost:3000`

### Available Endpoints

#### Customers
```
GET    /customers              - List customers
GET    /customers/:id          - Get customer by ID
GET    /customers/by-id/:customerId - Get customer by customerID
GET    /customers/stats        - Get customer statistics
POST   /customers              - Create customer
PUT    /customers/:id          - Update customer
DELETE /customers/:id          - Delete customer
POST   /customers/import       - Bulk import customers
```

#### Predictions
```
GET    /predictions            - List predictions
GET    /predictions/:id        - Get prediction by ID
GET    /predictions/stats      - Get prediction statistics
GET    /predictions/high-risk  - Get high-risk customers
GET    /predictions/medium-risk - Get medium-risk customers
POST   /predictions            - Make new prediction
POST   /predictions/customer/:customerId - Predict for existing customer
DELETE /predictions/:id        - Delete prediction
```

## Styling

### Tailwind CSS Classes Used
- **Layout**: `flex`, `grid`, `space-y`, `gap`
- **Colors**: `text-blue-600`, `bg-red-100`, `border-gray-200`
- **Components**: `card`, `btn-primary`, `input` (custom classes in `index.css`)

### Custom Components
- StatCard - Display metrics
- Risk badge with color coding
- Churn probability progress bar

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3000` | Backend API base URL |

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

### Docker

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

## Performance

- **Lightweight**: Uses pnpm for faster installations
- **Optimized Bundle**: Tree-shaking with Tailwind CSS
- **Code Splitting**: React Router lazy loading ready
- **Fast Refresh**: Hot module reloading in development

## Development Tips

### Format Code
```bash
pnpm format
```

### Check TypeScript Errors
```bash
pnpm tsc --noEmit
```

### Install New Package
```bash
pnpm add package-name
```

## Troubleshooting

**Backend connection failed**
- Ensure backend is running on port 3000: `npm run start:dev` in backend-nestjs
- Check `REACT_APP_API_URL` in .env

**Port 3000 already in use**
- Kill process: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
- Change port in package.json: `"start": "PORT=3001 react-scripts start"`

**Tailwind styles not applied**
- Run `pnpm install` again
- Clear cache: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

## License

MIT
