from flask import Flask, request, jsonify
import joblib
import os
import numpy as np
import pandas as pd

app = Flask(__name__)
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'

model = None
scaler = None

# Load model and scaler
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f'✓ Loaded model from {MODEL_PATH}')
    except Exception as e:
        print(f'✗ Failed to load model: {e}')

if os.path.exists(SCALER_PATH):
    try:
        scaler = joblib.load(SCALER_PATH)
        print(f'✓ Loaded scaler from {SCALER_PATH}')
    except Exception as e:
        print(f'✗ Failed to load scaler: {e}')

def get_recommendation(probability):
    """Business logic for recommendations based on churn probability."""
    if probability > 0.75:
        return {
            'risk_level': 'HIGH',
            'recommendation': 'Offer 10% discount + free premium services for 3 months',
            'priority': 'URGENT'
        }
    elif probability > 0.50:
        return {
            'risk_level': 'MEDIUM',
            'recommendation': 'Offer better contract options or service upgrade',
            'priority': 'HIGH'
        }
    else:
        return {
            'risk_level': 'LOW',
            'recommendation': 'No immediate action required. Monitor customer',
            'priority': 'NORMAL'
        }



@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    
    Expected input (JSON):
    {
      "tenure": 12,
      "MonthlyCharges": 75.0,
      "TotalCharges": 900.0,
      "SeniorCitizen": 0,
      "Contract": 0,  # label-encoded
      "InternetService": 1,  # label-encoded
      "PaymentMethod": 2,  # label-encoded
      ...other features...
    }
    
    Returns:
    {
      "success": true,
      "churn_probability": 0.75,
      "risk_level": "HIGH",
      "recommendation": "Offer 10% discount...",
      "priority": "URGENT"
    }
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not available. Please run train_model.py first.',
            'hint': 'Run: python train_model.py'
        }), 503
    
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'Empty request body'}), 400
        
        print(f'[predict] Received input data: {data}')
        
        # Basic validation: check if we have at least required fields
        required_fields = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen']
        missing_required = [f for f in required_fields if f not in data]
        if missing_required:
            return jsonify({
                'success': False, 
                'error': f'Missing required fields: {missing_required}'
            }), 400
        
        # Add default values for optional fields to match training data (19 features)
        # All values are numeric (LabelEncoded) to match clean_dataset.csv
        # Note: Backend should send numeric values (0, 1, 2, etc) not strings
        default_features = {
            'gender': 0,  # Default numeric value for binary field
            'Partner': 0,  # 0 = No, 1 = Yes
            'Dependents': 0,  # 0 = No, 1 = Yes
            'tenure': 0,
            'PhoneService': 0,  # 0 = No, 1 = Yes
            'MultipleLines': 0,  # 0 = No, 1 = Yes, 2 = No phone service
            'InternetService': 0,  # 0 = DSL, 1 = Fiber optic, 2 = No
            'OnlineSecurity': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'OnlineBackup': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'DeviceProtection': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'TechSupport': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'StreamingTV': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'StreamingMovies': 0,  # 0 = No, 1 = Yes, 2 = No internet service
            'Contract': 0,  # 0 = Month-to-month, 1 = One year, 2 = Two year
            'PaperlessBilling': 0,  # 0 = No, 1 = Yes
            'PaymentMethod': 0,  # 0 = Electronic check, 1 = Mailed check, 2 = Bank transfer, 3 = Credit card
            'MonthlyCharges': 0,
            'TotalCharges': 0,
            'SeniorCitizen': 0  # Already numeric in source data
        }
        
        # Merge with input data (input overrides defaults)
        full_data = {**default_features, **data}
        print(f'[predict] Full data with defaults: {full_data}')
        
        # Convert all unknown string values to numeric defaults
        # This handles the case where frontend might send strings instead of numbers
        categorical_mappings = {
            'gender': {'Male': 0, 'Female': 1},
            'Partner': {'No': 0, 'Yes': 1},
            'Dependents': {'No': 0, 'Yes': 1},
            'PhoneService': {'No': 0, 'Yes': 1},
            'MultipleLines': {'No': 0, 'Yes': 1, 'No phone service': 2},
            'InternetService': {'DSL': 0, 'Fiber optic': 1, 'No': 2},
            'OnlineSecurity': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'OnlineBackup': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'DeviceProtection': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'TechSupport': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'StreamingTV': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'StreamingMovies': {'No': 0, 'Yes': 1, 'No internet service': 2},
            'Contract': {'Month-to-month': 0, 'One year': 1, 'Two year': 2},
            'PaperlessBilling': {'No': 0, 'Yes': 1},
            'PaymentMethod': {'Electronic check': 0, 'Mailed check': 1, 'Bank transfer (automatic)': 2, 'Credit card (automatic)': 3},
        }
        
        # Convert string values to numeric if needed
        for key in full_data:
            if key in categorical_mappings and isinstance(full_data[key], str):
                mapping = categorical_mappings[key]
                full_data[key] = mapping.get(full_data[key], 0)
                print(f'[predict] Converted {key}: {full_data[key]}')
        
        # Convert input dict to DataFrame for scaler compatibility
        df_input = pd.DataFrame([full_data])
        print(f'[predict] DataFrame columns before processing: {list(df_input.columns)}')
        print(f'[predict] DataFrame shape before processing: {df_input.shape}')
        print(f'[predict] DataFrame dtypes: {df_input.dtypes.to_dict()}')
        
        # Ensure correct column order to match training data
        # Get feature names from scaler if available
        if scaler is not None and hasattr(scaler, 'feature_names_in_'):
            expected_columns = list(scaler.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            expected_columns = list(model.feature_names_in_)
        else:
            # Default columns based on training data
            expected_columns = ['gender', 'Partner', 'Dependents', 'tenure', 'PhoneService',
                             'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
                             'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
                             'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges',
                             'TotalCharges', 'SeniorCitizen']
        
        print(f'[predict] Expected columns: {expected_columns}')
        
        # Reorder DataFrame to match expected columns
        for col in expected_columns:
            if col not in df_input.columns:
                df_input[col] = default_features.get(col, 0)  # Use numeric default (0)
        
        df_input = df_input[expected_columns]
        print(f'[predict] DataFrame shape after reordering: {df_input.shape}')
        print(f'[predict] DataFrame values: {df_input.to_dict(orient="records")[0]}')
        
        # Scale numeric features if scaler available
        if scaler is not None:
            try:
                # Get numeric column names from original training
                numeric_cols = df_input.select_dtypes(include=['int64', 'float64']).columns.tolist()
                if numeric_cols:
                    print(f'[predict] Scaling columns: {numeric_cols}')
                    df_input[numeric_cols] = scaler.transform(df_input[numeric_cols])
            except Exception as scale_error:
                print(f'[predict] Scaler error (continuing without scaling): {scale_error}')
                # Continue without scaling - model might still work
        
        # Convert to numpy array in correct feature order
        X = df_input.values
        print(f'[predict] Input array shape: {X.shape}')
        
        # Predict probabilities
        prob_predictions = model.predict_proba(X)
        churn_prob = float(prob_predictions[0][1])  # Probability of churn (class 1)
        print(f'[predict] Predicted churn probability: {churn_prob}')
        
        # Get recommendation
        decision = get_recommendation(churn_prob)
        
        return jsonify({
            'success': True,
            'churn_probability': round(churn_prob, 4),
            'risk_level': decision['risk_level'],
            'recommendation': decision['recommendation'],
            'priority': decision['priority']
        }), 200
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f'[predict] Error: {error_trace}')
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 400

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    }), 200

if __name__ == '__main__':
    print("\n===== Churn Prediction API =====")
    print("Starting Flask server on http://0.0.0.0:5000")
    print("POST /predict - Make predictions")
    print("GET /health - Health check")
    print("=" * 40 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
