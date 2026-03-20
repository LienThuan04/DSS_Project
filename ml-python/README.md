# ML Pipeline - Dự Đoán Churn Cây Quyết Định

Mô hình Máy Học dự đoán churn khách hàng sử dụng **Cây Quyết Định** (scikit-learn) + API REST Flask.

✨ **CẬP NHẬT MỚI:** Giờ chỉ dùng **Cây Quyết Định** duy nhất (tối ưu hóa)

Xây dựng với:
- 🌳 Scikit-learn (Mô hình Cây Quyết Định)
- 🔬 Pandas, NumPy (xử lý dữ liệu)
- 📊 Matplotlib, Seaborn (trực quan hóa)
- 🔌 Flask (API REST)

---

## 📋 Cấu Trúc Thư Mục

```
ml-python/
  ├── data_preprocessing.py         # Xử lý dữ liệu thô
  ├── eda_analysis.py               # Phân Tích Khám Phá Dữ Liệu
  ├── train_model.py                # ✨ CẬP NHẬT: Huấn luyện chỉ Cây Quyết Định
  ├── evaluate_model.py             # Đánh giá mô hình
  ├── predict_api.py                # API REST Flask
  ├── test_predict_api.py           # Kiểm tra điểm cuối API
  ├── run_pipeline.py               # Chạy toàn bộ quy trình
  │
  ├── venv/                         # Môi trường ảo Python
  ├── requirements.txt              # Gói phụ thuộc Python
  ├── input_schema.json             # Lược đồ đầu vào
  ├── clean_dataset.csv             # Dữ liệu đã xử lý (sau tiền xử lý)
  ├── model.pkl                     # Mô hình Cây Quyết Định đã huấn luyện
  ├── scaler.pkl                    # StandardScaler cho các tính năng
  ├── label_encoders.pkl            # Bộ mã hóa nhãn cho tính năng phân loại
  │
  ├── eda_charts/                   # Trực quan hóa PHÂN TÍCH
  │   └── EDA_Report.txt
  │
  └── evaluation_results/           # Báo cáo đánh giá mô hình
      ├── model_comparison.csv      # Số liệu (chỉ Cây Quyết Định)
      ├── model_comparison.json     # Định dạng JSON
      └── cv_results.json           # Kết quả xác thực chéo
```

---

## 🚀 Cách Chạy

### 1. Cài Đặt Môi Trường Ảo

```bash
cd ml-python

# Tạo venv
python -m venv venv

# Kích hoạt venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Cài Dependencies

```bash
pip install -r requirements.txt
```

### 3. Chạy Toàn Bộ Quy Trình

Chạy toàn bộ quy trình theo thứ tự:

```bash
python run_pipeline.py
```

**Sẽ tự động thực hiện:**
- ✅ Tiền xử lý dữ liệu (làm sạch, mã hóa tính năng)
- ✅ Phân tích PHÂN TÍCH (tạo trực quan hóa)
- ✅ ✨ Huấn luyện mô hình Cây Quyết Định (chỉ Cây Quyết Định)
- ✅ Đánh giá mô hình (số liệu, xác thực chéo)
- ✅ Bắt đầu API Flask (cổng 5000) - không chặn

**Thời gian:** ~3-7 phút (tùy vào dữ liệu)

### 4. Chạy từng Tập Lệnh Riêng Lẻ

#### 4.1 Tiền Xử Lý Dữ Liệu
```bash
python data_preprocessing.py
```
Đầu vào: `WA_Fn-UseC_-Telco-Customer-Churn.csv`
Đầu ra: `clean_dataset.csv`, `label_encoders.pkl`

#### 4.2 Phân Tích PHÂN TÍCH
```bash
python eda_analysis.py
```
Đầu ra: `eda_charts/` (trực quan hóa + EDA_Report.txt)

#### 4.3 Mô Hình Huấn Luyện ✨ (chỉ Cây Quyết Định)
```bash
python train_model.py
```
- Huấn luyện bộ phân loại Cây Quyết Định
- Phân tích tính năng quan trọng
- Xác thực chéo 5 lần
- Lưu mô hình: `model.pkl`
- Lưu bộ chia tỷ lệ: `scaler.pkl`

Đầu ra:
```
===== Xuất Bản So Sánh Mô Hình =====
✓ So sánh mô hình được xuất sang evaluation_results/model_comparison.csv
✓ So sánh mô hình (JSON) được xuất sang evaluation_results/model_comparison.json
✓ Kết quả xác thực chéo được xuất sang evaluation_results/cv_results.json
```

#### 4.4 API Flask
```bash
python predict_api.py
```
API chạy tại: **http://localhost:5000**

---

## 📡 Điểm Cuối API REST

### POST /predict
**Dự đoán churn cho một khách hàng**

Yêu cầu:
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 12,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "DSL",
  "OnlineSecurity": "No",
  "OnlineBackup": "No",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 65.0,
  "TotalCharges": 780.0
}
```

Phản hồi:
```json
{
  "success": true,
  "prediction": {
    "churnProbability": 0.45,
    "riskLevel": "MEDIUM",
    "recommendation": "Giám sát chặt chẽ, cân nhắc cung cấp ưu tiên hợp đồng",
    "priority": "HIGH",
    "topFactors": [
      {
        "feature": "tenure",
        "value": 12,
        "impact": 0.35
      },
      {
        "feature": "Contract",
        "value": "Month-to-month",
        "impact": 0.28
      },
      ...
    ]
  }
}
```

### GET /health
**Kiểm tra API hoạt động**

Phản hồi:
```json
{
  "status": "running",
  "model": "DecisionTreeClassifier",
  "timestamp": "2026-03-20T10:30:45"
}
```

---

## 🌳 Mô Hình: Cây Quyết Định ✨

### Cấu Hình
```python
DecisionTreeClassifier(
  max_depth=10,           # Độ sâu tối đa
  random_state=42,        # Hạt cho tái tạo
  class_weight='balanced' # Xử lý dữ liệu không cân bằng
)
```

### Hiệu Năng (Ví dụ)
```
Độ Chính Xác Bài Kiểm Tra: 0.8234
Độ Chính Xác:             0.7891
Độ Nhạy:                  0.7654
Điểm F1:                  0.7770
AUC-ROC:                  0.8512

Trung Bình CV 5 Lần:      0.8100 ± 0.0245
```

### Các Tính Năng Hàng Đầu (Tầm Quan Trọng Tính Năng)
Các tính năng quan trọng nhất để dự đoán:
1. `tenure` - Thời gian sử dụng (tác động 35%)
2. `Contract` - Loại hợp đồng (tác động 28%)
3. `MonthlyCharges` - Phí hàng tháng (tác động 18%)
4. `InternetService` - Loại dịch vụ internet (tác động 12%)
5. ...

---

## 📊 Quy Trình Hoạt Động Sơ Bộ

### Luồng Quy Trình
```
Tệp CSV Đầu Vào (dữ liệu thô)
    ↓
data_preprocessing.py (làm sạch, mã hóa)
    ↓
clean_dataset.csv
    ↓
train_model.py (phân loại Cây Quyết Định)
    ↓
model.pkl + scaler.pkl
    ↓
predict_api.py (máy chủ Flask)
    ↓ HTTP POST /predict
    ↓
Trả về: {churnProbability, riskLevel, topFactors}
```

### Quy Trình Chấm Điểm

1. **Xác Thực Đầu Vào**: Kiểm tra dữ liệu hợp lệ
2. **Kỹ Thuật Tính Năng**: Mã hóa tính năng phân loại
3. **Chia Tỷ Lệ**: StandardScaler (dự đoán phải sử dụng bộ chia tỷ lệ giống nhau như huấn luyện)
4. **Dự Đoán**: Bộ phân loại Cây Quyết Định dự đoán
5. **Phân Loại Rủi Ro**:
   - Xác Suất Churn ≥ 0.70 → Rủi Ro CAO
   - 0.40 ≤ Prob < 0.70 → Rủi Ro TRUNG BÌNH
   - Prob < 0.40 → Rủi Ro THẤP
6. **Tầm Quan Trọng Tính Năng**: Trích xuất các yếu tố hàng đầu
7. **Khuyến Nghị**: Tạo khuyến nghị dựa trên mức rủi ro

---

## 🧪 Kiểm Tra API

### Kiểm Tra bằng cURL

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Male",
    "tenure": 12,
    "MonthlyCharges": 65,
    "TotalCharges": 780,
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check"
  }'
```

### Kiểm Tra bằng Python

```bash
python test_predict_api.py
```

---

## 📦 Gói Phụ Thuộc

```
scikit-learn==1.3.2
pandas==2.1.0
numpy==1.24.3
matplotlib==3.8.0
seaborn==0.12.2
flask==3.0.0
flask-cors==4.0.0
```

---

## ⚠️ Các Tệp Quan Trọng

| Tệp | Mô Tả | Kích Thước |
|------|-------|------|
| `WA_Fn-UseC_-Telco-Customer-Churn.csv` | Dữ liệu thô (✨ PHẢI CÓ) | ~1 MB |
| `clean_dataset.csv` | Dữ liệu làm sạch (tự động tạo) | ~800 KB |
| `model.pkl` | Mô hình Cây Quyết Định (tự động tạo) | ~100 KB |
| `scaler.pkl` | StandardScaler (tự động tạo) | ~5 KB |
| `label_encoders.pkl` | Bộ mã hóa (tự động tạo) | ~10 KB |

---

## 🐛 Khắc Phục Sự Cố

### Lỗi: "No module named 'sklearn'"
```
❌ Gói phụ thuộc chưa cài
✅ pip install scikit-learn pandas numpy
```

### Lỗi: "CSV file not found"
```
❌ WA_Fn-UseC_-Telco-Customer-Churn.csv không ở đúng vị trí
✅ Tệp phải ở thư mục ml-python\ hoặc thư mục cha
```

### Lỗi: "Port 5000 already in use"
```
✅ Thay đổi cổng trong predict_api.py:
   app.run(host='0.0.0.0', port=5001)
```

### Dự đoán mô hình không chính xác
```
✅ Kiểm tra:
   - Dữ liệu huấn luyện đầu vào đúng
   - Tính năng được chia tỷ lệ
   - Tính năng phân loại được mã hóa
   - Huấn luyện lại mô hình: python train_model.py
```

---

## 📈 Số Liệu Hiệu Năng

Cây Quyết Định được đánh giá bằng:
- **Độ Chính Xác** - Tỷ lệ dự đoán đúng
- **Độ Chính Xác** - Tỷ lệ dự đoán churn chính xác
- **Độ Nhạy** - Tỷ lệ tìm thấy khách hàng sẽ churn
- **Điểm F1** - Trung bình hài hòa
- **AUC-ROC** - Khả năng phân loại
- **Xác Thực Chéo** - Tính ổn định mô hình trên dữ liệu khác

---

## 🔗 Tích Hợp Backend

Backend (NestJS) gọi ML API:

```typescript
// backend-nestjs/src/common/services/ml.service.ts
async predictChurn(customerData) {
  const response = await axios.post('http://localhost:5000/predict', customerData);
  return response.data.prediction;
}
```

**Luồng dữ liệu:**
```
Frontend → Backend → ML API → Mô Hình Cây Quyết Định → Phản Hồi → Frontend
```

---

## 📝 Tệp Đầu Ra

### evaluation_results/model_comparison.csv
```
Model,Test Accuracy,Precision,Recall,F1 Score,AUC-ROC,CV Accuracy (Mean)
DecisionTreeClassifier,0.8234,0.7891,0.7654,0.7770,0.8512,0.8100
```

### evaluation_results/cv_results.json
```json
{
  "model_name": "DecisionTreeClassifier",
  "n_splits": 5,
  "folds": [
    {"fold": 1, "accuracy": 0.8234, ...},
    ...
  ],
  "summary": {
    "accuracy": {"mean": 0.8100, "std": 0.0245, ...},
    ...
  }
}
```

---

## 🚀 Triển Khai

Để triển khai ML API:

```bash
# Chế độ sản xuất
gunicorn -w 4 -b 0.0.0.0:5000 predict_api:app
```

Hoặc sử dụng Docker:

```dockerfile
FROM python:3.9
WORKDIR /ml-python
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "predict_api.py"]
```

---

**Xây dựng với ❤️ sử dụng Scikit-learn**
