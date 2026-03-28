# 📊 TELCO CHURN DSS - Hướng Dẫn Xử Lí Dữ Liệu & Dự Đoán

Tài liệu này giải thích chi tiết toàn bộ quy trình từ **import file dữ liệu ở Frontend** → **Xử lí ở Backend** → **Xử lí & Huấn luyện ở ML-Python** → **Trả kết quả lại Frontend**.

---

## 🔄 I. TỔNG QUAN FLOW DỮ LIỆU

```
┌──────────────────────┐
│ FRONTEND (React)     │
│ - Import CSV File    │  
│ - Prediction Form    │
│ - What-If Simulation │
└──────────┬───────────┘
           │ HTTP REST API (Axios)
           │ 1. POST /api/customers/import (CSV)
           │ 2. POST /api/predictions (form data)
           │ 3. POST /api/predictions/what-if
           ↓
┌──────────────────────────────────────┐
│ BACKEND (NestJS + MongoDB)           │
│ - Nhận dữ liệu từ Frontend           │
│ - Validate & Parse dữ liệu           │
│ - Gọi ML-Python API                  │
│ - Lưu kết quả vào Database           │
│ - Trả response về Frontend           │
└──────────┬──────────────────────────┘
           │ HTTP POST http://localhost:5000/predict (JSON)
           ↓
┌──────────────────────────────────────┐
│ ML-PYTHON (Flask + scikit-learn)     │
│ - Encode Categorical Features        │
│ - Scale Numeric Features             │
│ - Dự đoán (Predict Churn Probability)│
│ - Extract Top Factors                │
│ - Trả Recommendation                 │
└──────────┬──────────────────────────┘
           │ JSON Response với churn_probability
           ↓
┌──────────────────────┐
│ BACKEND (tiếp tục)   │
│ - Process kết quả ML │
│ - Apply rules engine │
│ - Trả về Frontend    │
└──────────┬───────────┘
           │ JSON Response
           ↓
┌──────────────────────┐
│ FRONTEND             │
│ - Display kết quả    │
│ - Show dự đoán       │
│ - Show tư vấn        │
└──────────────────────┘
```

---

## 📥 II. IMPORT DỮ LIỆU TỪ FRONTEND

### **2.1. Flow Import CSV**

**Frontend (Customers.tsx):**
```typescript
// 1. Người dùng chọn file CSV
const file: File = event.target.files[0];
// VD: WA_Fn-UseC_-Telco-Customer-Churn.csv (7043 rows)

// 2. Tạo FormData object
const formData = new FormData();
formData.append('file', file);
// Content-Type: multipart/form-data (tự động)

// 3. Gửi POST request
const response = await fetch('/api/customers/import', {
  method: 'POST',
  body: formData
});

// 4. Nhận response
if (response.success) {
  alert(`✓ ${response.imported} khách hàng nhập thành công`);
  // Hiển thị lỗi nếu có
  response.validationErrors.forEach(err => {
    console.warn(`Row ${err.row}: ${err.errors.join(', ')}`);
  });
}
```

**CSV File Format (tối thiểu phải có các cột):**
```csv
customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges,Churn
C0001,Male,0,No,No,2,No,No,DSL,No,Yes,No,No,No,No,Month-to-month,Yes,Electronic check,65.0,130.0,No
C0002,Female,0,No,No,45,No,No,Fiber optic,No,No,No,No,Yes,Yes,One year,No,Bank transfer,103.7,4659.9,No
...
```

### **2.2. Backend Xử Lí File**

**Backend (customers.controller.ts):**
```typescript
@Post('import')
@UseInterceptors(FileInterceptor('file'))
async importFromCsv(@UploadedFile() file?: any) {
  // 1. Nhận file binary từ Frontend
  const csvText = file.buffer.toString('utf8');  // Convert bytes to string
  // Result: "customerID,gender,...\nC0001,Male,..."
  
  // 2. Parse & Validate CSV
  const customers = await this.customersService.parseAndValidateCsv(csvText);
  
  // 3. Import vào MongoDB
  const result = await this.customersService.importFromCsv(customers);
  
  // 4. Trả response
  return {
    success: true,
    imported: result.length,
    errors: [],
    validationErrors: []
  };
}
```

**Backend (customers.service.ts):**
```typescript
async parseAndValidateCsv(csvText: string): Promise<CreateCustomerDto[]> {
  // ===== GIAI ĐOẠN 1: Parse CSV =====
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const customers: CreateCustomerDto[] = [];
  const validationErrors = [];
  
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const values = lines[rowIndex].split(',').map(v => v.trim());
    
    // Tạo object từ headers & values
    const customer: any = {};
    for (let i = 0; i < headers.length; i++) {
      customer[headers[i]] = values[i];
    }
    
    // ===== GIAI ĐOẠN 2: Validate mỗi row =====
    const valResult = this.validationService.validateRecord(customer, rowIndex);
    
    if (valResult.valid) {
      // Type conversion
      customer.tenure = parseInt(customer.tenure);
      customer.MonthlyCharges = parseFloat(customer.MonthlyCharges);
      customer.TotalCharges = parseFloat(customer.TotalCharges);
      customer.SeniorCitizen = parseInt(customer.SeniorCitizen);
      
      customers.push(customer);
    } else {
      validationErrors.push({
        row: rowIndex,
        customerId: customer.customerID,
        errors: valResult.errors
      });
    }
  }
  
  return customers;  // Chỉ trả valid records
}

async importFromCsv(customers: CreateCustomerDto[]) {
  // ===== GIAI ĐOẠN 3: Import vào MongoDB =====
  try {
    const result = await this.customerModel.insertMany(customers, { 
      ordered: false  // Tiếp tục insert dù có lỗi
    });
    return result;
  } catch (error) {
    // Catch duplicate customerID, validation errors từ schema
    throw new BadRequestException({
      message: 'Import failed',
      details: error.message
    });
  }
}
```

**Validation Rules (validation.service.ts):**
```typescript
validateRecord(record: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors = [];
  
  // ===== Rule 1: Required fields =====
  if (!record.customerID) errors.push('customerID bắt buộc');
  if (!record.gender) errors.push('gender bắt buộc');
  if (record.tenure === undefined) errors.push('tenure bắt buộc');
  
  // ===== Rule 2: Kiểu dữ liệu =====
  const tenure = parseInt(record.tenure);
  if (isNaN(tenure)) errors.push('tenure phải là số');
  if (tenure < 0 || tenure > 72) errors.push('tenure phải từ 0-72 tháng');
  
  const monthlyCharges = parseFloat(record.MonthlyCharges);
  if (isNaN(monthlyCharges)) errors.push('MonthlyCharges phải là số');
  if (monthlyCharges < 0) errors.push('MonthlyCharges không được âm');
  
  // ===== Rule 3: Enum values =====
  const validGenders = ['Male', 'Female'];
  if (!validGenders.includes(record.gender)) {
    errors.push(`gender phải là: ${validGenders.join(', ')}`);
  }
  
  const validContracts = ['Month-to-month', 'One year', 'Two year'];
  if (!validContracts.includes(record.Contract)) {
    errors.push(`Contract phải là: ${validContracts.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Sau khi Import xong:**
- ✅ Dữ liệu lưu vào MongoDB collection `customers`
- ✅ Có thể dùng để dự đoán thêm sau

---

## 🎯 III. FORM DỰ ĐOÁN & GỬI API

### **3.1. Frontend Form Prediction**

**Frontend (PredictionForm.tsx):**
```typescript
// Người dùng điền form thủ công
const [formData, setFormData] = useState({
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 12,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 65.0,
  TotalCharges: 780.0
});

// 1. Frontend Validation
const isValid = () => {
  if (formData.tenure < 0 || formData.tenure > 72) return false;
  if (formData.MonthlyCharges < 0) return false;
  return true;
};

// 2. Gửi API (POST /api/predictions)
const handleSubmit = async () => {
  if (!isValid()) {
    alert('Vui lòng điền đúng dữ liệu');
    return;
  }
  
  try {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // ✅ Dự đoán thành công
      console.log('Churn probability:', data.prediction.churnProbability);
      // {
      //   _id: "507f1f77bcf86cd799439011",
      //   churnProbability: 0.82,
      //   riskLevel: 'HIGH',
      //   recommendation: '...',
      //   priority: 'URGENT',
      //   topFactors: [...]
      // }
      
      // Hiển thị kết quả
      displayPredictionResult(data.prediction);
    } else {
      alert('Lỗi: ' + data.error);
    }
  } catch (error) {
    alert('Không thể kết nối Backend');
  }
};
```

### **3.2. Backend Nhận & Gọi ML-Python**

**Backend (predictions.controller.ts):**
```typescript
@Post()
async predict(
  @Body() makePredictionDto: MakePredictionDto,
  @Query('customerId') customerId?: string
) {
  // 1. Nhận form data từ Frontend
  // makePredictionDto = { gender: 'Male', tenure: 12, ... }
  
  // 2. Gọi service xử lí
  return this.predictionsService.predict(customerId, makePredictionDto);
}
```

**Backend (predictions.service.ts):**
```typescript
async predict(customerId: string, data: MakePredictionDto): Promise<any> {
  try {
    // ========== BƯỚC 1: Gọi ML-Python API ==========
    const mlResult = await this.mlService.predict(data);
    // data = {
    //   gender: 'Male',
    //   tenure: 12,
    //   MonthlyCharges: 65,
    //   Contract: 'Month-to-month',
    //   ... (19 features total)
    // }
    
    if (!mlResult.success) {
      throw new BadRequestException(mlResult.error);
    }
    
    // mlResult = {
    //   churn_probability: 0.82,
    //   risk_level: 'HIGH',
    //   recommendation: "...",
    //   top_factors: [
    //     { feature: 'MonthlyCharges', value: 1.23, impact: 0.25 },
    //     ...
    //   ]
    // }
    
    // ========== BƯỚC 2: Apply Business Rules (Backend) ==========
    const recommendationInput = {
      churnProbability: mlResult.churn_probability,  // 0.82
      tenure: data.tenure,                           // 12
      monthlyCharges: data.MonthlyCharges,           // 65
      contract: data.Contract,                       // 'Month-to-month'
      paymentMethod: data.PaymentMethod,
      internetService: data.InternetService,
      // ... other fields
    };
    
    const recommendation = this.recommendationService.getRecommendation(
      recommendationInput
    );
    // → {
    //     priority: 'URGENT',
    //     recommendation: 'Month-to-month customer at high risk! Recommend upgrade...',
    //     reasonCodes: ['HIGH_CHURN_MONTH_TO_MONTH', 'CONTRACT_UPGRADE_OPPORTUNITY']
    //   }
    
    const riskLevel = this.recommendationService.getRiskLevel(
      mlResult.churn_probability
    );
    // 0.82 → 'HIGH' (vì > 0.75)
    
    // ========== BƯỚC 3: Lưu vào MongoDB ==========
    const prediction = new this.predictionModel({
      customerId: customerId || null,
      churnProbability: mlResult.churn_probability,
      riskLevel: riskLevel,
      recommendation: recommendation.recommendation,
      priority: recommendation.priority,
      reasonCodes: recommendation.reasonCodes,
      topFactors: mlResult.top_factors,
      inputSnapshot: data,
      status: 'success',
      modelVersion: '1.0.0',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)  // TTL 90 days
    });
    
    const savedPrediction = await prediction.save();
    
    // ========== BƯỚC 4: Trả response ==========
    return {
      success: true,
      prediction: {
        _id: savedPrediction._id,
        customerId: savedPrediction.customerId,
        churnProbability: savedPrediction.churnProbability,
        riskLevel: savedPrediction.riskLevel,
        recommendation: savedPrediction.recommendation,
        priority: savedPrediction.priority,
        topFactors: savedPrediction.topFactors,
        createdAt: savedPrediction.createdAt
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

**Backend (ml.service.ts - Gọi Flask API):**
```typescript
async predict(data: Record<string, any>): Promise<{
  success: boolean;
  churn_probability?: number;
  top_factors?: Array<{ feature; value; impact }>;
  error?: string;
}> {
  try {
    // Gọi Flask API tại http://localhost:5000/predict
    const response = await this.axiosInstance.post('/predict', data);
    
    // Response format:
    // {
    //   success: true,
    //   churn_probability: 0.82,
    //   risk_level: 'HIGH',
    //   recommendation: '...',
    //   top_factors: [...]
    // }
    
    if (response.data.success) {
      return {
        success: true,
        churn_probability: response.data.churn_probability,
        top_factors: response.data.top_factors,
        risk_level: response.data.risk_level
      };
    } else {
      return {
        success: false,
        error: response.data.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Flask API error: ${error.message}. Make sure Python ML server is running`
    };
  }
}
```

---

## 🤖 IV. ML-PYTHON XỬ LÍ & HUẤN LUYỆN

### **4.1. Data Preprocessing (data_preprocessing.py)**

Giai đoạn này chuẩn bị dữ liệu thô cho huấn luyện model.

**Bước 1: Load CSV thô**
```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# Load raw CSV (7043 rows × 21 columns)
df = pd.read_csv('WA_Fn-UseC_-Telco-Customer-Churn.csv')

print(df.shape)  # (7043, 21)
print(df.head())
# Output:
#   customerID  gender  SeniorCitizen  Partner  Dependents  tenure  ... Churn
# 0  C7051-VHVEG    Male              0       No         No       1  ...   No
# 1  C5124-WKHLJ    Female            0       No         No      34  ...   No
```

**Bước 2: Làm sạch dữ liệu**
```python
# Kiến tra missing values
print(df.isnull().sum())
# TotalCharges: 11 missing (có dấu cách thay vì số)

# Fix TotalCharges (convert to numeric, handle spaces)
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')

# Fill missing values
df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)

# Kiểm tra lại
print(df.isnull().sum())  # All 0 ✓
```

**Bước 3: Chuyển Yes/No → 0/1**
```python
# Columns cần convert
yes_no_cols = [
    'Partner', 'Dependents', 'PhoneService', 'OnlineSecurity',
    'OnlineBackup', 'DeviceProtection', 'TechSupport',
    'StreamingTV', 'StreamingMovies', 'PaperlessBilling', 'Churn'
]

for col in yes_no_cols:
    df[col] = df[col].map({'Yes': 1, 'No': 0})

# Example:
# Before: Partner = ['No', 'Yes', 'No', ...]
# After:  Partner = [0, 1, 0, ...]
```

**Bước 4: Encode Categorical Features**
```python
from sklearn.preprocessing import LabelEncoder

label_encoders = {}
categorical_cols = ['gender', 'InternetService', 'OnlineSecurity', 
                   'OnlineBackup', 'DeviceProtection', 'TechSupport',
                   'StreamingTV', 'StreamingMovies', 'Contract',
                   'PaymentMethod', 'PhoneService', 'MultipleLines']

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le  # Lưu để dùng lại trong predict
    
    # Ví dụ gender:
    # Before: ['Male', 'Female', 'Male', ...]
    # After:  [0, 1, 0, ...]
    # Mapping: {'Male': 0, 'Female': 1}
    
    # Ví dụ Contract:
    # Before: ['Month-to-month', 'One year', 'Two year', ...]
    # After:  [0, 1, 2, ...]
    # Mapping: {'Month-to-month': 0, 'One year': 1, 'Two year': 2}
    
    # Ví dụ InternetService:
    # Before: ['DSL', 'Fiber optic', 'No', ...]
    # After:  [0, 1, 2, ...]
    # Mapping: {'DSL': 0, 'Fiber optic': 1, 'No': 2}

# Lưu label encoders để dùng trong predict
import pickle
with open('label_encoders.pkl', 'wb') as f:
    pickle.dump(label_encoders, f)
```

**Bước 5: Drop customerID (không cần cho ML)**
```python
df = df.drop(columns=['customerID'])
```

**Bước 6: Lưu cleaned dataset**
```python
df.to_csv('clean_dataset.csv', index=False)

# Final shape: (7043, 20)
# Columns: [gender, SeniorCitizen, Partner, ..., TotalCharges, Churn]
# Kiểu dữ liệu: all numeric (int64, float64)
```

**Summary bước preprocessing:**
```
Raw CSV (7043 × 21)
    ↓
Kiểm tra missing, fix TotalCharges
    ↓
Convert Yes/No → 0/1
    ↓
Encode categorical (LabelEncoder)
    ↓
Drop customerID
    ↓
Clean CSV (7043 × 20) + label_encoders.pkl
```

---

### **4.2. Model Training (train_model.py)**

Huấn luyện Decision Tree model để dự đoán churn.

**Bước 1: Load + Feature Engineering**
```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Load cleaned data
df = pd.read_csv('clean_dataset.csv')

# Tách Features (X) & Target (y)
X = df.drop(columns=['Churn'])  # 19 features
y = df['Churn']                  # Target (0/1)

print(X.shape)  # (7043, 19)
print(y.shape)  # (7043,)

# Kiểm tra churn ratio
print(y.value_counts())
# 0    5174 (73% no churn)
# 1    1869 (27% churn)
# Ratio: 2.77 (acceptable, < 3)
```

**Bước 2: Scale Features**
```python
scaler = StandardScaler()
numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

# Example: tenure column
# Before: [1, 34, 2, 45, ...]
# After:  [-0.85, 0.52, -0.81, 0.98, ...]  (normalized by std)

# Lưu scaler
import pickle
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
```

**Bước 3: Chia Train/Test**
```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,       # 20% test
    random_state=42,     
    stratify=y           # Giữ churn ratio (27% in both train & test)
)

print(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")
# Train: 5634 (80%)
# Test:  1409 (20%)

# Churn ratio kiểm tra
print(f"Train churn: {y_train.sum() / len(y_train) * 100:.1f}%")
print(f"Test churn:  {y_test.sum() / len(y_test) * 100:.1f}%")
# Train churn: 27%
# Test churn:  27% ✓ (stratified)
```

**Bước 4: Huấn luyện Decision Tree**
```python
# Tạo model
model = DecisionTreeClassifier(
    max_depth=10,           # Giới hạn độ sâu
    min_samples_leaf=5,     # Ít nhất 5 samples/leaf
    random_state=42,
    class_weight=None       # Không cần (ratio chấp nhận được)
)

# Huấn luyện
model.fit(X_train, y_train)
print("✓ Model trained successfully")

# Dự đoán
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)
```

**Bước 5: Evaluate Model**
```python
# Train Set Metrics
train_acc = accuracy_score(y_train, y_pred_train)
train_precision = precision_score(y_train, y_pred_train)
train_recall = recall_score(y_train, y_pred_train)
train_f1 = f1_score(y_train, y_pred_train)

print("TRAIN SET:")
print(f"  Accuracy:  {train_acc:.2%}")  # 95%
print(f"  Precision: {train_precision:.2%}")  # 88%
print(f"  Recall:    {train_recall:.2%}")     # 65%
print(f"  F1-Score:  {train_f1:.2%}")        # 74%

# Test Set Metrics (quan trọng hơn!)
test_acc = accuracy_score(y_test, y_pred_test)
test_precision = precision_score(y_test, y_pred_test)
test_recall = recall_score(y_test, y_pred_test)
test_f1 = f1_score(y_test, y_pred_test)
test_auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])

print("\nTEST SET:")
print(f"  Accuracy:  {test_acc:.2%}")  # 82% ✓
print(f"  Precision: {test_precision:.2%}")  # 73%
print(f"  Recall:    {test_recall:.2%}")     # 58%
print(f"  F1-Score:  {test_f1:.2%}")        # 65%
print(f"  AUC:       {test_auc:.2%}")       # 88% ✓

# ✅ Overfitting không quá (train 95% vs test 82% acceptable)
# ✅ F1=65% tốt cho imbalanced problem
# ✅ AUC=88% tuyệt vời!
```

**Bước 6: Feature Importance**
```python
# Lấy feature importances
importances = model.feature_importances_
feature_names = X.columns

# Top 10 features
top_indices = np.argsort(importances)[-10:][::-1]

print("TOP 10 FEATURES:")
for i, idx in enumerate(top_indices):
    print(f"{i+1}. {feature_names[idx]}: {importances[idx]:.2%}")

# Output (ví dụ):
# 1. MonthlyCharges:  25%
# 2. tenure:          20%
# 3. Contract:        15%
# 4. InternetService: 12%
# 5. TechSupport:      8%
# ...
```

**Bước 7: Cross-Validation (kiểm tra ổn định)**
```python
from sklearn.model_selection import cross_val_score

cv_scores = cross_val_score(
    model, X_train, y_train,
    cv=5,  # 5-fold
    scoring='f1'
)

print(f"Cross-Validation F1 Scores: {cv_scores}")
# Output: [0.64, 0.68, 0.63, 0.66, 0.65]

print(f"Mean: {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
# Mean: 65% ± 2% ✓ (stable, không overfitting)
```

**Bước 8: Lưu Model**
```python
import pickle

# Lưu model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✓ Model saved to model.pkl")

# Tập tin sinh ra:
# - model.pkl (Decision Tree model)
# - scaler.pkl (StandardScaler)
# - label_encoders.pkl (Category mappings)
```

**Summary bước training:**
```
Clean CSV (7043 × 20)
    ↓
Scale features
    ↓
Train/Test split (80/20 stratified)
    ↓
Train Decision Tree (max_depth=10)
    ↓
Evaluate: Test accuracy 82%, F1 65%, AUC 88%
    ↓
Cross-validate: 65% ± 2% (ổn định)
    ↓
Lưu: model.pkl, scaler.pkl, label_encoders.pkl
```

---

### **4.3. Prediction Logic (predict_api.py)**

Flask API xử lí dự đoán real-time.

**Bước 1: Load Model & Preprocessing Objects**
```python
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import pickle
import json

app = Flask(__name__)

# Load trained model & preprocessing objects
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
    
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
    
with open('label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)

# Expected feature order
EXPECTED_FEATURES = [
    'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
    'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
    'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
    'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
    'MonthlyCharges', 'TotalCharges'
]

# Load validation schema
with open('input_schema.json', 'r') as f:
    SCHEMA = json.load(f)
```

**Bước 2: Validate Input**
```python
def validate_input_data(data):
    """
    Validate input theo schema
    
    Input: {
      "gender": "Male",
      "tenure": 12,
      "MonthlyCharges": 65,
      ...
    }
    
    Return: (is_valid: bool, errors: list)
    """
    errors = []
    
    # Check required fields
    for field in EXPECTED_FEATURES:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check data types & ranges
    if 'tenure' in data:
        tenure = data['tenure']
        if not isinstance(tenure, (int, float)):
            errors.append("tenure must be numeric")
        elif tenure < 0 or tenure > 72:
            errors.append("tenure must be between 0 and 72")
    
    if 'MonthlyCharges' in data:
        charges = data['MonthlyCharges']
        if not isinstance(charges, (int, float)):
            errors.append("MonthlyCharges must be numeric")
        elif charges < 0:
            errors.append("MonthlyCharges cannot be negative")
    
    # Check categorical enum values
    if 'gender' in data:
        if data['gender'] not in ['Male', 'Female']:
            errors.append("gender must be Male or Female")
    
    if 'Contract' in data:
        if data['Contract'] not in ['Month-to-month', 'One year', 'Two year']:
            errors.append("Contract invalid")
    
    # ... more validation rules ...
    
    return len(errors) == 0, errors
```

**Bước 3: Encode & Scale Input**
```python
@app.route('/predict', methods=['POST'])
def predict():
    """
    Dự đoán churn probability cho customer
    
    Request:
    {
      "gender": "Male",
      "SeniorCitizen": 0,
      "Partner": "No",
      "tenure": 12,
      ...
      "MonthlyCharges": 65,
      "TotalCharges": 780
    }
    
    Response:
    {
      "success": true,
      "churn_probability": 0.82,
      "risk_level": "HIGH",
      "recommendation": "...",
      "top_factors": [...]
    }
    """
    
    try:
        # ===== STEP 1: Nhật input JSON =====
        data = request.json
        
        # ===== STEP 2: Validate =====
        is_valid, errors = validate_input_data(data)
        if not is_valid:
            return {
                'success': False,
                'error': 'Validation failed',
                'details': errors
            }, 400
        
        # ===== STEP 3: Convert to DataFrame =====
        df_input = pd.DataFrame([data])  # 1 row
        # df_input:
        # gender  SeniorCitizen  Partner  ...  MonthlyCharges  TotalCharges
        # Male    0              No       ...   65              780
        
        # ===== STEP 4: Encode Categorical Features =====
        for col in df_input.columns:
            if col in label_encoders:
                le = label_encoders[col]
                # Transform value using fitted encoder
                df_input[col] = le.transform(df_input[col].astype(str))
        
        # After encoding:
        # gender  SeniorCitizen  Partner  ...  MonthlyCharges  TotalCharges
        # 0       0              0        ...   65              780
        
        # ===== STEP 5: Reorder Columns =====
        df_input = df_input[EXPECTED_FEATURES]
        
        # ===== STEP 6: Scale Features =====
        df_scaled = df_input.copy()
        numeric_cols = df_input.select_dtypes(include=['int64', 'float64']).columns
        df_scaled[numeric_cols] = scaler.transform(df_input[numeric_cols])
        
        # After scaling (StandardScaler):
        # gender  SeniorCitizen  Partner  ...  MonthlyCharges  TotalCharges
        # -0.52   -0.21          -0.89    ...   1.23            -0.15
        
        # ===== STEP 7: Predict =====
        probabilities = model.predict_proba(df_scaled)
        # Output: [[0.18, 0.82]]  (prob no-churn, prob churn)
        
        churn_prob = float(probabilities[0][1])  # 0.82
        
        # ===== STEP 8: Get Risk Level =====
        if churn_prob > 0.75:
            risk_level = 'HIGH'
        elif churn_prob > 0.50:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        # ===== STEP 9: Get Recommendation (hardcoded) =====
        if churn_prob > 0.85:
            recommendation = 'Immediate intervention needed! Offer welcome-back discount...'
        elif churn_prob > 0.75:
            recommendation = 'High-risk customer. Recommend contract upgrade or premium service...'
        elif churn_prob > 0.60:
            recommendation = 'Monitor closely. Consider proactive outreach...'
        else:
            recommendation = 'Low risk. Continue normal service.'
        
        # ===== STEP 10: Extract Top Factors (Feature Importance) =====
        importances = model.feature_importances_
        top_5_indices = np.argsort(importances)[-5:][::-1]
        
        top_factors = []
        for idx in top_5_indices:
            top_factors.append({
                'feature': EXPECTED_FEATURES[idx],
                'value': float(df_scaled.iloc[0, idx]),  # Scaled value
                'importance': float(importances[idx])
            })
        
        # ===== STEP 11: Return Response =====
        return {
            'success': True,
            'churn_probability': round(churn_prob, 4),
            'risk_level': risk_level,
            'recommendation': recommendation,
            'top_factors': top_factors
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

**Example Flow - Input → Output:**

Input:
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "No",
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
  "TotalCharges": 780.0,
  "SeniorCitizen": 0
}
```

Processing:
```
1. Validate: ✓ All required fields present, valid ranges
2. Encode categorical:
   - gender: "Male" → 0
   - Contract: "Month-to-month" → 0
   - InternetService: "DSL" → 0
3. Scale:
   - tenure: 12 → 0.15 (normalized)
   - MonthlyCharges: 65 → 1.23
4. Predict: [0.18, 0.82] → churn_prob = 0.82
5. Risk level: 0.82 > 0.75 → HIGH
6. Recommendation: Generate based on rules
7. Top factors: Extract from feature importance
```

Output:
```json
{
  "success": true,
  "churn_probability": 0.8234,
  "risk_level": "HIGH",
  "recommendation": "High-risk month-to-month customer. Recommend immediate upgrade to 1-2 year contract or proactive discount offer.",
  "top_factors": [
    {
      "feature": "MonthlyCharges",
      "value": 1.23,
      "importance": 0.25
    },
    {
      "feature": "tenure",
      "value": 0.15,
      "importance": 0.20
    },
    {
      "feature": "Contract",
      "value": -0.89,
      "importance": 0.15
    },
    {
      "feature": "InternetService",
      "value": -1.02,
      "importance": 0.12
    },
    {
      "feature": "TechSupport",
      "value": -0.75,
      "importance": 0.08
    }
  ]
}
```

---

## 🔄 V. WHAT-IF SIMULATION

### **5.1. Khái Niệm What-If**

What-If cho phép khách hàng **so sánh 2 kịch bản**:
- **Base Scenario**: Tình trạng hiện tại
- **Scenario**: Tình trạng nếu thay đổi một số feature

**Ví dụ:**
- Base: Customer với tenure=12 tháng, Contract=Month-to-month → Churn risk 82%
- Scenario: Nếu upgrade sang 1-year contract → Churn risk = ?

### **5.2. Frontend What-If Interface**

**Frontend (WhatIfSimulation.tsx):**
```typescript
// 1. User chọn base customer
const selectedCustomer = {
  _id: "507f1f77bcf86cd799439011",
  customerId: "C0001",
  gender: "Male",
  tenure: 12,
  Contract: "Month-to-month",
  TechSupport: "No",
  MonthlyCharges: 65,
  // ... all fields
};

// 2. User nhập changes (what-if queries)
const changes = {
  tenure: 24,           // "Nếu giữ lâu hơn 12 tháng?"
  Contract: "One year", // "Nếu nâng cấp contract?"
  TechSupport: "Yes"    // "Nếu thêm tech support?"
  // Không nhập = giữ nguyên
};

// 3. Gửi API
const request = {
  customerId: selectedCustomer._id,
  changes: changes,
  scenarioName: "Upgrade to 1-year contract + tech support"
};

const response = await fetch('/api/predictions/what-if', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

// 4. Nhận response
const result = await response.json();
// {
//   success: true,
//   comparison: {
//     scenarioName: "...",
//     base: { churnProbability: 0.82, riskLevel: 'HIGH', ... },
//     scenario: { churnProbability: 0.45, riskLevel: 'MEDIUM', ... },
//     delta: { probabilityDelta: -0.37, probabilityDeltaPercent: -45.1%, ... }
//   }
// }

// 5. Display so sánh
displayComparison(result.comparison);
```

### **5.3. Backend What-If Logic**

**Backend (predictions.service.ts):**

```typescript
async whatIfSimulation(whatIfRequest: any): Promise<any> {
  const { customerId, changes, scenarioName } = whatIfRequest;
  
  try {
    // ========== STEP 1: Lấy base customer data ==========
    let baseCustomer: any;
    
    if (customerId) {
      // Tìm từ MongoDB (ObjectId hoặc customerID)
      if (isValidObjectId(customerId)) {
        baseCustomer = await this.customerModel.findById(customerId).lean();
      } else {
        baseCustomer = await this.customerModel.findOne({ 
          customerID: customerId 
        }).lean();
      }
      
      if (!baseCustomer) {
        throw new NotFoundException('Customer not found');
      }
    }
    
    // baseCustomer = {
    //   gender: "Male",
    //   SeniorCitizen: 0,
    //   Partner: "No",
    //   tenure: 12,
    //   MonthlyCharges: 65,
    //   ... (19 fields)
    // }
    
    // ========== STEP 2: Tạo scenario data (merge changes) ==========
    const scenarioData = { ...baseCustomer, ...changes };
    
    // Example:
    // baseCustomer: { tenure: 12, Contract: 'Month-to-month', ... }
    // changes: { tenure: 24, Contract: 'One year' }
    // scenarioData: { tenure: 24, Contract: 'One year', ... }
    
    // ========== STEP 3: Predict 2 lần (base + scenario) ==========
    const basePredictionResult = await this.mlService.predict(baseCustomer);
    // → { churn_probability: 0.82, top_factors: [...] }
    
    const scenarioPredictionResult = await this.mlService.predict(scenarioData);
    // → { churn_probability: 0.45, top_factors: [...] }
    
    if (!basePredictionResult.success || !scenarioPredictionResult.success) {
      throw new ServiceUnavailableException('ML Service unavailable');
    }
    
    // ========== STEP 4: Get risk levels ==========
    const baseRiskLevel = this.recommendationService.getRiskLevel(
      basePredictionResult.churn_probability
    );
    // 0.82 > 0.75 → 'HIGH'
    
    const scenarioRiskLevel = this.recommendationService.getRiskLevel(
      scenarioPredictionResult.churn_probability
    );
    // 0.45 < 0.75 → 'MEDIUM'
    
    // ========== STEP 5: Get recommendations ==========
    const baseRecommendation = this.recommendationService.getRecommendation({
      churnProbability: basePredictionResult.churn_probability,  // 0.82
      tenure: baseCustomer.tenure,                              // 12
      monthlyCharges: baseCustomer.MonthlyCharges,
      contract: baseCustomer.Contract,                          // 'Month-to-month'
      // ... other fields
    });
    // → {
    //   priority: 'URGENT',
    //   recommendation: 'Month-to-month customer at high risk...',
    //   reasonCodes: ['HIGH_CHURN_MONTH_TO_MONTH', ...]
    // }
    
    const scenarioRecommendation = this.recommendationService.getRecommendation({
      churnProbability: scenarioPredictionResult.churn_probability,  // 0.45
      tenure: scenarioData.tenure,                                    // 24
      monthlyCharges: scenarioData.MonthlyCharges,
      contract: scenarioData.Contract,                                // 'One year'
      // ... other fields
    });
    // → {
    //   priority: 'HIGH',
    //   recommendation: 'Customer with 1-year contract has lower risk...',
    //   reasonCodes: ['CONTRACT_COMMITTED', ...]
    // }
    
    // ========== STEP 6: Calculate delta (difference) ==========
    const probabilityDelta = 
      scenarioPredictionResult.churn_probability - basePredictionResult.churn_probability;
    // 0.45 - 0.82 = -0.37
    
    const probabilityDeltaPercent = 
      (probabilityDelta / basePredictionResult.churn_probability) * 100;
    // (-0.37 / 0.82) * 100 = -45.1%
    
    const riskLevelChanged = baseRiskLevel !== scenarioRiskLevel;
    // 'HIGH' !== 'MEDIUM' = true
    
    const priorityChanged = 
      baseRecommendation.priority !== scenarioRecommendation.priority;
    // 'URGENT' !== 'HIGH' = true
    
    // ========== STEP 7: Build summary ==========
    let summary = '';
    if (probabilityDelta < -0.1) {
      summary = `Churn risk DECREASES by ${Math.abs(probabilityDeltaPercent).toFixed(1)}% points`;
    } else if (probabilityDelta > 0.1) {
      summary = `Churn risk INCREASES by ${probabilityDeltaPercent.toFixed(1)}% points`;
    } else {
      summary = `Churn risk remains stable (change: ${probabilityDeltaPercent.toFixed(1)}%)`;
    }
    
    if (riskLevelChanged) {
      summary += ` (${baseRiskLevel} → ${scenarioRiskLevel})`;
    }
    
    // "Churn risk DECREASES by 45.1% points (HIGH → MEDIUM)"
    
    // ========== STEP 8: Return comparison ==========
    return {
      success: true,
      comparison: {
        scenarioName: scenarioName,
        
        base: {
          churnProbability: basePredictionResult.churn_probability,
          riskLevel: baseRiskLevel,
          recommendation: baseRecommendation.recommendation,
          priority: baseRecommendation.priority,
          topFactors: basePredictionResult.top_factors
        },
        
        scenario: {
          churnProbability: scenarioPredictionResult.churn_probability,
          riskLevel: scenarioRiskLevel,
          recommendation: scenarioRecommendation.recommendation,
          priority: scenarioRecommendation.priority,
          topFactors: scenarioPredictionResult.top_factors
        },
        
        delta: {
          probabilityDelta: Number(probabilityDelta.toFixed(4)),
          probabilityDeltaPercent: Number(probabilityDeltaPercent.toFixed(2)),
          riskLevelChanged: riskLevelChanged,
          priorityChanged: priorityChanged,
          summary: summary
        },
        
        inputSnapshot: {
          baseData: baseCustomer,
          changes: changes,
          scenarioData: scenarioData
        }
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### **5.4. Frontend Display What-If Result**

**Frontend (ScenarioComparison.tsx):**

```typescript
// Input: comparison object từ backend
const comparison = {
  scenarioName: "Upgrade to 1-year contract + tech support",
  
  base: {
    churnProbability: 0.8234,
    riskLevel: 'HIGH',
    recommendation: 'Month-to-month customer...',
    priority: 'URGENT',
    topFactors: [...]
  },
  
  scenario: {
    churnProbability: 0.4521,
    riskLevel: 'MEDIUM',
    recommendation: 'Customer with 1-year contract...',
    priority: 'HIGH',
    topFactors: [...]
  },
  
  delta: {
    probabilityDelta: -0.3713,
    probabilityDeltaPercent: -45.1,
    riskLevelChanged: true,
    priorityChanged: true,
    summary: "Churn risk DECREASES by 45.1% points (HIGH → MEDIUM)"
  }
};

// Display component
return (
  <div className="scenario-comparison">
    <h2>{comparison.scenarioName}</h2>
    
    <div className="grid-2">
      {/* BASE SCENARIO */}
      <div className="scenario-card base">
        <h3>📍 Current Situation</h3>
        
        <div className="risk-gauge">
          <circle percentage={comparison.base.churnProbability * 100} />
          <span className="percentage">
            {(comparison.base.churnProbability * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="risk-badge" style={{ color: getRiskColor('HIGH') }}>
          🔴 {comparison.base.riskLevel}
        </div>
        
        <div className="priority-badge priority-urgent">
          ⚠️ {comparison.base.priority}
        </div>
        
        <div className="recommendation">
          <p>{comparison.base.recommendation}</p>
        </div>
        
        <div className="top-factors">
          <h4>Top Factors:</h4>
          <ul>
            {comparison.base.topFactors.map((f, i) => (
              <li key={i}>
                {i+1}. {f.feature}: {f.importance.toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* SCENARIO */}
      <div className="scenario-card scenario">
        <h3>✨ If Changes Apply</h3>
        
        <div className="risk-gauge">
          <circle percentage={comparison.scenario.churnProbability * 100} />
          <span className="percentage">
            {(comparison.scenario.churnProbability * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="risk-badge" style={{ color: getRiskColor('MEDIUM') }}>
          🟠 {comparison.scenario.riskLevel}
        </div>
        
        <div className="priority-badge priority-high">
          ⚠️ {comparison.scenario.priority}
        </div>
        
        <div className="recommendation">
          <p>{comparison.scenario.recommendation}</p>
        </div>
        
        <div className="top-factors">
          <h4>Top Factors:</h4>
          <ul>
            {comparison.scenario.topFactors.map((f, i) => (
              <li key={i}>
                {i+1}. {f.feature}: {f.importance.toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    
    {/* IMPACT / DELTA */}
    <div className="delta-summary">
      <h3>📊 Impact Analysis</h3>
      
      <div className="delta-metrics">
        <div className="metric">
          <label>Probability Change:</label>
          <span className={comparison.delta.probabilityDelta < 0 ? 'positive' : 'negative'}>
            {comparison.delta.probabilityDelta > 0 ? '+' : ''}
            {(comparison.delta.probabilityDelta * 100).toFixed(1)} points 
            ({comparison.delta.probabilityDeltaPercent.toFixed(1)}%)
          </span>
        </div>
        
        <div className="metric">
          <label>Risk Level:</label>
          <span>
            {comparison.delta.riskLevelChanged 
              ? `${comparison.base.riskLevel} → ${comparison.scenario.riskLevel}` 
              : 'No change'}
          </span>
        </div>
        
        <div className="metric">
          <label>Priority:</label>
          <span>
            {comparison.delta.priorityChanged 
              ? `${comparison.base.priority} → ${comparison.scenario.priority}` 
              : 'No change'}
          </span>
        </div>
      </div>
      
      <div className="summary">
        <p><strong>Summary:</strong> {comparison.delta.summary}</p>
      </div>
      
      <button onClick={() => applyScenario()}>
        ✅ Apply This Scenario
      </button>
    </div>
  </div>
);
```

---

## 🎯 VI. RECOMMENDATION RULES ENGINE

Backend có rules engine để chuyển đổi churn probability → business actions.

**Backend (recommendation.service.ts):**

```typescript
getRecommendation(input: RecommendationInput): RecommendationOutput {
  const { 
    churnProbability,  // 0-1
    tenure,            // months
    monthlyCharges,    // $
    contract,          // 'Month-to-month', 'One year', 'Two year'
    internetService,   // 'DSL', 'Fiber optic', 'No'
    techSupport        // 'Yes', 'No', 'No internet service'
  } = input;
  
  // ===== RULE 1: CRITICAL - New customer + very high churn =====
  if (churnProbability > 0.85 && tenure < 6) {
    return {
      priority: 'URGENT',
      recommendation: `🚨 CRITICAL: Customer at extreme risk (${(churnProbability*100).toFixed(0)}% churn). 
                      Immediate intervention needed!
                      Actions: 
                      1. Personal call from account manager
                      2. Offer welcome-back discount (20-30%)
                      3. Complimentary premium service upgrade
                      4. Dedicated support line access`,
      reasonCodes: ['CRITICAL_NEW_CUSTOMER', 'EXTREME_CHURN_RISK', 'INTERVENTION_NEEDED']
    };
  }
  
  // ===== RULE 2: High churn + Month-to-month contract =====
  if (churnProbability > 0.75 && contract === 'Month-to-month') {
    return {
      priority: 'URGENT',
      recommendation: `⚠️ Month-to-month customer at high risk (${(churnProbability*100).toFixed(0)}% churn).
                      Actions:
                      1. Recommend upgrade to 1-2 year plan
                      2. Offer discount for commitment: 10% off for 1-year, 15% off for 2-year
                      3. Highlight benefits of commitment:
                         - Price certainty
                         - Early termination discount
                         - Loyalty rewards`,
      reasonCodes: ['HIGH_CHURN_MONTH_TO_MONTH', 'CONTRACT_UPGRADE_OPPORTUNITY']
    };
  }
  
  // ===== RULE 3: High value customer + high churn =====
  if (churnProbability > 0.70 && monthlyCharges > 100) {
    return {
      priority: 'HIGH',
      recommendation: `💰 HIGH-VALUE customer at risk (${(churnProbability*100).toFixed(0)}% churn, $${monthlyCharges}/mo).
                      Actions:
                      1. Priority review of service quality
                      2. Offer bundle discount (5-10% off)
                      3. Add premium services: prioritized support, advanced features
                      4. Regular check-in calls (quarterly)`,
      reasonCodes: ['HIGH_CHURN_HIGH_VALUE', 'PRICE_SENSITIVITY', 'VIP_RETENTION']
    };
  }
  
  // ===== RULE 4: Medium churn + no tech support =====
  if (churnProbability > 0.55 && techSupport === 'No') {
    return {
      priority: 'HIGH',
      recommendation: `📞 Medium-risk customer without tech support (${(churnProbability*100).toFixed(0)}% churn).
                      Actions:
                      1. Recommend tech support add-on
                      2. Offer discounted first month ($5 instead of $15)
                      3. Highlight benefits: 24/7 support, reduced downtime
                      4. Cross-sell other services`,
      reasonCodes: ['MEDIUM_CHURN_NO_SUPPORT', 'UPSELL_OPPORTUNITY']
    };
  }
  
  // ===== RULE 5: Long-term loyal customer + low churn =====
  if (churnProbability < 0.30 && tenure > 36) {
    return {
      priority: 'LOW',
      recommendation: `✅ Loyal customer (${tenure} months tenure, ${(churnProbability*100).toFixed(0)}% churn).
                      Actions:
                      1. Regular appreciation outreach
                      2. Exclusive loyalty rewards: annual gift, priority support tier
                      3. Invite to beta programs
                      4. Personal relationship building`,
      reasonCodes: ['LOYAL_CUSTOMER', 'LOW_CHURN', 'VIP_CARE']
    };
  }
  
  // ===== DEFAULT RULE: Balanced approach =====
  return {
    priority: 'NORMAL',
    recommendation: `ℹ️ Standard monitoring (${(churnProbability*100).toFixed(0)}% churn risk).
                    Actions:
                    1. Continue normal service monitoring
                    2. Quarterly satisfaction check-in`,
    reasonCodes: ['STANDARD_MONITORING']
  };
}

getRiskLevel(churnProbability: number): string {
  if (churnProbability > 0.75) return 'HIGH';
  if (churnProbability > 0.50) return 'MEDIUM';
  return 'LOW';
}
```

---

## 📈 VII. COMPLETE END-TO-END FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - User Upload CSV File                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User selects CSV file (WA_Fn-UseC_-Telco-Customer-Churn.csv)    │
│  2. Click "Import" button                                           │
│  3. Frontend creates FormData with file                             │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ POST /api/customers/import (multipart/form-data)
                  │ file.buffer = [...binary CSV data...]
                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BACKEND - Parse & Validate CSV                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Receive file.buffer (binary data)                                │
│  2. Convert to UTF-8 string                                          │
│  3. Split by newlines → rows                                         │
│  4. Split each row by commas → columns & values                      │
│  5. Validate each row:                                               │
│     - Required fields present (customerID, tenure, ...)              │
│     - Data types correct (tenure: numeric 0-72)                      │
│     - Enum values valid (gender: Male/Female, ...)                   │
│  6. Type conversion: tenure → int, MonthlyCharges → float            │
│                                                                      │
└─────────────────┬────────────────────────────────────────────────────┘
                  │ Valid records: [{ customerID, gender, tenure, ... }, ...]
                  │ Invalid records: [{ row: 5, errors: [...] }, ...]
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND - Insert to MongoDB                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  - db.customers.insertMany(validRecords)                            │
│  - Bulk insert 150 records (example)                                │
│  - MongoDB creates _id for each                                     │
│  - Return: { imported: 150, errors: [], validationErrors: [...] }   │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Response to Frontend
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - Display Import Result                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ Successfully imported 150 customers                             │
│  ⚠️ 5 validation errors in rows: 3, 7, 12, 15, 18                   │
│                                                                     │
│  Next → User can make predictions on imported customers             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════╗
║                    PREDICTION FLOW                                  ║
╚═════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - User Makes Prediction                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Option A: Manual Form Prediction                                   │
│  - User fills form: gender, tenure, MonthlyCharges, ...             │
│  - Click "Predict" button                                           │
│  - Send JSON: { gender: "Male", tenure: 12, ... }                   │
│                                                                     │
│  Option B: Predict from Database Customer                           │
│  - Select customer from list                                        │
│  - Send POST with customerId                                        │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ POST /api/predictions (JSON body)
                  │ { gender: "Male", tenure: 12, MonthlyCharges: 65, ... }
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND - Prepare Data for ML                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. predictionsService.predict() receives form data                 │
│  2. Structure: { gender, tenure, MonthlyCharges, ... } (19 features)│
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Call mlService.predict(data)
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND → ML-PYTHON API (HTTP POST)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  POST http://localhost:5000/predict                                 │
│  Content-Type: application/json                                     │
│  Body: {                                                            │
│    "gender": "Male",           ← 0 (encoded)                        │
│    "tenure": 12,               ← Stay as is                         │
│    "MonthlyCharges": 65,       ← Stay as is                         │
│    ...                                                              │
│  }                                                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Request received by Flask
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON (Flask) - Load Models                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Load model.pkl (Decision Tree model trained on 5634 records)    │
│  2. Load scaler.pkl (StandardScaler for feature scaling)            │
│  3. Load label_encoders.pkl (for categorical encoding)              │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Process input
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON - Encode Categorical Features                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Input: { gender: "Male", Contract: "Month-to-month", ... }         │
│                                                                     │
│  1. For each categorical column, apply label encoder:               │
│     - gender: "Male" → int 0 (from label_encoders['gender'])        │
│     - Contract: "Month-to-month" → int 0                            │
│     - InternetService: "DSL" → int 0                                │
│     - PaymentMethod: "Electronic check" → int 1                     │
│                                                                     │
│  Output: { 0, 0, 0, 0, 12, ... } (all numeric)                      │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Scale features
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON - Scale Features (StandardScaler)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Apply StandardScaler to numeric columns                         │
│     (already trained on full dataset 7043 records)                  │
│                                                                     │
│  Example:                                                           │
│  - tenure: 12 → 0.15 (normalized by mean & std from training)       │
│  - MonthlyCharges: 65 → 1.23                                        │
│  - TotalCharges: 780 → -0.15                                        │
│                                                                     │
│  Output: [-0.52, -0.21, -0.89, ..., 1.23, -0.15]  (19 scaled values)│
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Run prediction
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON - Decision Tree Prediction                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  model.predict_proba(scaled_data)                                   │
│                                                                     │
│  Decision Tree makes decision based on learned splits:              │
│    "If MonthlyCharges > threshold AND tenure < 20 AND ..."          │
│    "  Then high churn risk"                                         │
│                                                                     │
│  Output: [[0.18, 0.82]]  ← [prob_no_churn, prob_churn]              │
│                                                                     │
│  churn_probability = 0.82 (82% risk of churn)                       │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Extract features importance
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON - Feature Importance (Top Factors)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  model.feature_importances_                                         │
│  → [0.25, 0.20, 0.15, 0.12, 0.08, ..., 0.01]                        │
│                                                                     │
│  Top 5:                                                             │
│  1. MonthlyCharges: 0.25 (25%)  ← Most important feature            │
│  2. tenure: 0.20 (20%)                                              │
│  3. Contract: 0.15 (15%)                                            │
│  4. InternetService: 0.12 (12%)                                     │
│  5. TechSupport: 0.08 (8%)                                          │
│                                                                     │
│  These explain WHY churn probability is high                        │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Format response
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ML-PYTHON - Return JSON Response                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  {                                                                  │
│    "success": true,                                                 │
│    "churn_probability": 0.8234,                                     │
│    "risk_level": "HIGH",       ← Hardcoded in Flask                 │
│    "recommendation": "High-risk customer...",                       │
│    "top_factors": [                                                 │
│      { "feature": "MonthlyCharges", "value": 1.23, "impact": 0.25}, │
│      { "feature": "tenure", "value": 0.15, "impact": 0.20 },        │
│      ...                                                            │
│    ]                                                                │
│  }                                                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Response received by Backend
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND - Process ML Result                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Receive ML response: churn_probability = 0.8234                 │
│  2. Apply Recommendation Rules:                                     │
│     - High churn + Month-to-month contract?                         │
│     → Priority = 'URGENT'                                           │
│     → Recommendation = "Upgrade to 1-year plan..."                  │
│     → reasonCodes = ['HIGH_CHURN_MONTH_TO_MONTH', ...]              │
│  3. Calculate risk level:                                           │
│     - 0.8234 > 0.75? → riskLevel = 'HIGH'                           │
│  4. Save to MongoDB:                                                │
│     db.predictions.insertOne({                                      │
│       customerId,                                                   │
│       churnProbability: 0.8234,                                     │
│       riskLevel: 'HIGH',                                            │
│       recommendation: "...",                                        │
│       priority: 'URGENT',                                           │
│       topFactors: [...],                                            │
│       expiresAt: Date.now() + 90 days  (TTL)                        │
│     })                                                              │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Response to Frontend
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND RESPONSE - JSON Format                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  {                                                                  │
│    "success": true,                                                 │
│    "prediction": {                                                  │
│      "_id": "507f1f77bcf86cd799439011",                             │
│      "customerId": "C0001",                                         │
│      "churnProbability": 0.8234,                                    │
│      "riskLevel": "HIGH",                                           │
│      "recommendation": "Month-to-month customer at high risk...",   │
│      "priority": "URGENT",                                          │
│      "topFactors": [                                                │
│        { "feature": "MonthlyCharges", ... },                        │
│        { "feature": "tenure", ... },                                │
│        ...                                                          │
│      ],                                                             │
│      "createdAt": "2024-01-15T10:30:00Z"                            │
│    }                                                                │
│  }                                                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ JSON response
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - Display Prediction Result                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ PREDICTION CARD ─────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Churn Risk: 82% 🔴 HIGH                                      │  │
│  │  Priority: ⚠️ URGENT                                          │  │
│  │                                                               │  │
│  │  Recommendation:                                              │  │
│  │  "Month-to-month customer at high risk. Recommend upgrade     │  │
│  │   to 1-2 year plan. Offer 10% discount for commitment."       │  │
│  │                                                               │  │
│  │  Top Factors:                                                 │  │
│  │  1. MonthlyCharges: $65/mo (25% impact)                       │  │
│  │  2. tenure: 12 months (20% impact)                            │  │
│  │  3. Contract: Month-to-month (15% impact)                     │  │
│  │  4. InternetService: DSL (12% impact)                         │  │
│  │  5. TechSupport: No (8% impact)                               │  │
│  │                                                               │  │
│  │  [Save]  [What-If Analysis]  [Share]                          │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  → User can now run What-If to see how changes affect risk          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════╗
║                     WHAT-IF FLOW                                    ║
╚═════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - User Runs What-If Simulation                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Current Customer (from above prediction):                          │
│  - gender: "Male", tenure: 12, Contract: "Month-to-month", ...      │
│  → Churn: 82% (HIGH)                                                │
│                                                                     │
│  User enters scenario changes:                                      │
│  - Upgrade tenure: 12 → 24 months                                   │
│  - Upgrade contract: "Month-to-month" → "One year"                  │
│  - Add tech support: "No" → "Yes"                                   │
│                                                                     │
│  Scenario Name: "Upgrade to 1-year contract + tech support"         │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ POST /api/predictions/what-if
                  │ {
                  │   customerId: "507f1f77bcf86cd799439011",
                  │   changes: {
                  │     tenure: 24,
                  │     Contract: "One year",
                  │     TechSupport: "Yes"
                  │   },
                  │   scenarioName: "..."
                  │ }
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND - What-If Simulation Logic                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Fetch base customer from MongoDB                                │
│     baseCustomer = { gender, tenure: 12, Contract: "...", ... }     │
│                                                                     │
│  2. Build scenario data (merge changes)                             │
│     scenarioData = { ...baseCustomer, ..changes }                   │
│     → { gender, tenure: 24, Contract: "One year", TechSupport: ... }│
│                                                                     │
│  3. Predict TWICE:                                                  │
│     a) Base prediction: mlService.predict(baseCustomer)             │
│        → churn_probability: 0.82, top_factors: [...]                │
│                                                                     │
│     b) Scenario prediction: mlService.predict(scenarioData)         │
│        → churn_probability: 0.45, top_factors: [...]                │
│                                                                     │
│  4. Calculate delta:                                                │
│     - probabilityDelta = 0.45 - 0.82 = -0.37                        │
│     - percentDelta = (-0.37 / 0.82) * 100 = -45.1%                  │
│     - riskLevelChanged = 'HIGH' → 'MEDIUM'? YES                     │
│                                                                     │
│  5. Build recommendations for both:                                 │
│     - baseRecommendation (priority: URGENT)                         │
│     - scenarioRecommendation (priority: HIGH)                       │
│                                                                     │
│  6. Prepare summary:                                                │
│     "Churn risk DECREASES by 45.1% (HIGH → MEDIUM)"                 │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Response
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND RESPONSE - What-If Result                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  {                                                                  │
│    "success": true,                                                 │
│    "comparison": {                                                  │
│      "scenarioName": "Upgrade to 1-year contract + tech support",   │
│                                                                     │
│      "base": {                                                      │
│        "churnProbability": 0.8234,                                  │
│        "riskLevel": "HIGH",                                         │
│        "recommendation": "Month-to-month customer at high risk...", │
│        "priority": "URGENT",                                        │
│        "topFactors": [...]                                          │
│      },                                                             │
│                                                                     │
│      "scenario": {                                                  │
│        "churnProbability": 0.4521,                                  │
│        "riskLevel": "MEDIUM",                                       │
│        "recommendation": "Customer with 1-year contract...",        │
│        "priority": "HIGH",                                          │
│        "topFactors": [...]                                          │
│      },                                                             │
│                                                                     │
│      "delta": {                                                     │
│        "probabilityDelta": -0.3713,                                 │
│        "probabilityDeltaPercent": -45.1,                            │
│        "riskLevelChanged": true,                                    │
│        "priorityChanged": true,                                     │
│        "summary": "Churn risk DECREASES by 45.1% (HIGH → MEDIUM)"   │
│      }                                                              │
│    }                                                                │
│  }                                                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ JSON response
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - Display What-If Comparison (Side-by-Side)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ BASE SCENARIO ──────┬─ IF CHANGES APPLY ──────┐                 │
│  │                       │                        │                 │
│  │ 📍 CURRENT SITUATION   │ ✨ UPDATED SCENARIO  │                 │
│  │                       │                        │                 │
│  │ Churn Risk: 82%       │ Churn Risk: 45%        │                 │
│  │ 🔴 HIGH              │ 🟠 MEDIUM              │                 │
│  │                       │                        │                 │
│  │ ⚠️ URGENT             │ ⚠️ HIGH               │                 │
│  │                       │                        │                 │
│  │ Month-to-month        │ One year contract      │                 │
│  │ No tech support       │ Tech support added     │                 │
│  │ 12 months tenure      │ 24 months tenure       │                 │
│  │                       │                        │                 │
│  │ Top Factors:          │ Top Factors:           │                 │
│  │ 1. MonthlyCharges     │ 1. tenure              │                 │
│  │ 2. tenure             │ 2. Contract            │                 │
│  │ 3. Contract           │ 3. MonthlyCharges      │                 │
│  │                       │                        │                 │
│  └───────────────────────┴────────────────────────┘                 │
│                                                                     │
│  ┌─ IMPACT ANALYSIS ──────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │ 📊 Probability Change:  -0.37 (-45.1%)  ✅ IMPROVEMENT        │ │
│  │                                                                │ │
│  │ 🎯 Risk Level:  HIGH → MEDIUM  ✅ DOWNGRADED                  │ │
│  │                                                                │ │
│  │ ⚠️ Priority:    URGENT → HIGH   ✅ REDUCED                    │ │
│  │                                                                │ │
│  │ Summary: "Churn risk DECREASES by 45% (HIGH → MEDIUM)"         │ │
│  │                                                                │ │
│  │ Insight: Upgrading to 1-year contract significantly reduces    │ │
│  │          churn risk. Worth recommending to customer!           │ │
│  │                                                                │ │
│  │ [✅ Apply Scenario]  [📧 Share with Team]  [📊 Export Report]│ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  → User now has clear action: Recommend contract upgrade!           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ VIII. TÓM TẮT CÁC THÀNH PHẦN

| Thành Phần | Tiêu đề | Vai Trò |
|-----------|--------|---------|
| **Frontend** | React + TypeScript | UI/UX, User Input, Display Results |
| **Backend** | NestJS + MongoDB | API, Business Logic, Recommendations, DB |
| **ML-Python** | Flask + scikit-learn | Model Training, Predictions, Feature Engineering |

| Giai Đoạn | Công Việc | Output |
|-----------|----------|--------|
| **1. Preprocessing** | Clean data, encode categories, scale | clean_dataset.csv, label_encoders.pkl |
| **2. Training** | Train Decision Tree, evaluate | model.pkl, scaler.pkl, metrics |
| **3. Prediction** | Encode input, scale, predict | churn_probability, top_factors |
| **4. Recommendation** | Apply business rules | priority, recommendation, action items |
| **5. What-If** | Compare 2 scenarios | delta analysis, impact summary |

---

## 🚀 IX. CHẠY HỆ THỐNG LOCALLY

**Step 1: Start ML-Python Server**
```bash
cd ml-python
python predict_api.py
# Listening on http://localhost:5000/predict
```

**Step 2: Start Backend**
```bash
cd backend-nestjs
npm install
npm start
# Listening on http://localhost:3001
# Connected to MongoDB
# Calling ML API on http://localhost:5000
```

**Step 3: Start Frontend**
```bash
cd frontend-react
npm install
npm start
# Listening on http://localhost:3000
# Calling Backend API on http://localhost:3001
```

**Step 4: Import Data**
```
1. Go to http://localhost:3000/customers
2. Click "Import CSV"
3. Select WA_Fn-UseC_-Telco-Customer-Churn.csv
4. ✅ 7043 customers imported
```

**Step 5: Make Predictions**
```
1. Go to http://localhost:3000/predictions
2. Option A: Fill manual form & click "Predict"
3. Option B: Select customer & click "Get Rating"
4. View results: churn probability, risk level, recommendations
```

**Step 6: What-If Simulation**
```
1. Go to http://localhost:3000/what-if
2. Select base customer
3. Enter changes (tenure, contract, tech support, etc.)
4. See side-by-side comparison & delta analysis
```

---

## 📋 X. KEY TAKEAWAYS

✅ **Data Flow:**
- CSV import → Validate → Store in MongoDB
- Form/Customer data → Send to ML API
- ML predicts churn probability
- Backend applies business rules
- Frontend displays results

✅ **ML Components:**
- Preprocessing: Encode categorical, scale numeric features
- Training: Decision Tree with max_depth=10
- Prediction: model.predict_proba() → [prob_no_churn, prob_churn]
- Feature importance: Extract top 5 factors explaining the prediction

✅ **What-If:**
- Select base customer data
- Apply changes (scenario)
- Predict twice (base + scenario)
- Compare churn probabilities & risk levels
- Show impact & recommendations

✅ **Recommendations:**
- Business rules engine converts churn probability → action items
- Priority levels: URGENT, HIGH, NORMAL, LOW
- Personalized suggestions based on customer profile

---

**Cập nhật: 2025**
