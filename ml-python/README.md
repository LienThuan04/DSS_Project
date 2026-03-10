# ML Pipeline: Churn Prediction

Machine Learning module for Customer Churn Prediction using Scikit-learn + Flask.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Complete Pipeline

```bash
python run_pipeline.py
```

This will execute:
- **data_preprocessing.py** - Load CSV, clean, encode features → `clean_dataset.csv`
- **eda_analysis.py** - Exploratory analysis, generate charts → `eda_charts/`
- **train_model.py** - Train 3 models (Logistic Regression, Decision Tree, Random Forest) → `model.pkl`, `scaler.pkl`
- **evaluate_model.py** - Evaluate on test set, ROC curve, feature importance → `evaluation_results/`

### 3. Start Prediction API

```bash
python predict_api.py
```

API runs on http://0.0.0.0:5000

## Scripts

### data_preprocessing.py
Load WA_Fn-UseC_-Telco-Customer-Churn.csv, clean missing values, convert Yes/No to binary, encode categorical features.
- Output: `clean_dataset.csv`

### eda_analysis.py
Generate visualizations: churn distribution pie chart, churn by contract/internet service, tenure histogram, monthly charges vs churn.
- Output: `eda_charts/` (PNG images + text report)

### train_model.py
Train 3 models with feature scaling (StandardScaler):
- Logistic Regression
- Decision Tree (max_depth=10)
- Random Forest (100 trees)

Evaluate with: accuracy, precision, recall, F1, confusion matrix, cross-validation.
Save best model (by F1 score).
- Output: `model.pkl`, `scaler.pkl`

### evaluate_model.py
Evaluate best model: confusion matrix visualization, ROC curve, feature importance, detailed report.
- Output: `evaluation_results/` (PNG charts + text report)

### predict_api.py
Flask REST API for real-time predictions.

**Endpoints:**

- `POST /predict` - Make prediction
  ```json
  {
    "tenure": 12,
    "MonthlyCharges": 75.0,
    "TotalCharges": 900.0,
    "SeniorCitizen": 0,
    "Contract": 0,
    "InternetService": 1,
    ...
  }
  ```
  
  Response:
  ```json
  {
    "success": true,
    "churn_probability": 0.75,
    "risk_level": "HIGH",
    "recommendation": "Offer 10% discount + free premium services for 3 months",
    "priority": "URGENT"
  }
  ```

- `GET /health` - Health check
  ```json
  {
    "status": "ok",
    "model_loaded": true,
    "scaler_loaded": true
  }
  ```

## Models Comparison

After running `python train_model.py`:

| Model | Train Accuracy | Test Accuracy | Precision | Recall | F1 Score |
|-------|---|---|---|---|---|
| Logistic Regression | ~0.80 | ~0.79 | ~0.65 | ~0.50 | ~0.56 |
| Decision Tree | ~0.95 | ~0.76 | ~0.70 | ~0.48 | ~0.57 |
| Random Forest | ~0.97 | ~0.80 | ~0.75 | ~0.55 | ~0.63 |

Best model: **Random Forest** (highest F1 score, balanced precision-recall)

## Troubleshooting

**Error: CSV file not found**
- Ensure `WA_Fn-UseC_-Telco-Customer-Churn.csv` is in the parent directory (`../`)

**Error: Model not available**
- Run `python train_model.py` first to generate `model.pkl`

**Error: numpy/pandas import failed**
- Reinstall: `pip install -r requirements.txt --upgrade`

## Integration with Backend

Backend calls this API from NestJS:

```javascript
// In backend /api/predict endpoint
const response = await axios.post('http://localhost:5000/predict', customerData);
```

## Deployment

Deploy `predict_api.py` to:
- **Render** (free tier available)
- **Heroku** (with Procfile)
- **AWS EC2 / Lambda**
- **Azure App Service**

Example Procfile for Heroku:
```
web: gunicorn predict_api:app
```
