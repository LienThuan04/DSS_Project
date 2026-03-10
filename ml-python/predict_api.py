
from flask import Flask, request, jsonify
import joblib
import os
import json
import numpy as np
import pandas as pd
from jsonschema import validate, ValidationError

app = Flask(__name__)
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'
ENCODERS_PATH = 'label_encoders.pkl'
SCHEMA_PATH = 'input_schema.json'

model = None
scaler = None
label_encoders = None
input_schema = None
feature_names = None

# Load input schema
if os.path.exists(SCHEMA_PATH):
    try:
        with open(SCHEMA_PATH, 'r') as f:
            input_schema = json.load(f)
        print(f'[OK] Loaded input schema from {SCHEMA_PATH}')
    except Exception as e:
        print(f'[FAIL] Failed to load input schema: {e}')

# Load label encoders
if os.path.exists(ENCODERS_PATH):
    try:
        label_encoders = joblib.load(ENCODERS_PATH)
        print(f'[OK] Loaded label encoders from {ENCODERS_PATH}')
        print(f'     Encoded columns: {list(label_encoders.keys())}')
    except Exception as e:
        print(f'[FAIL] Failed to load label encoders: {e}')
        label_encoders = None

# Load model and scaler
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f'[OK] Loaded model from {MODEL_PATH}')
        # Extract feature names from model
        if hasattr(model, 'feature_names_in_'):
            feature_names = list(model.feature_names_in_)
    except Exception as e:
        print(f'[FAIL] Failed to load model: {e}')

if os.path.exists(SCALER_PATH):
    try:
        scaler = joblib.load(SCALER_PATH)
        print(f'[OK] Loaded scaler from {SCALER_PATH}')
    except Exception as e:
        print(f'[FAIL] Failed to load scaler: {e}')

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

def validate_input_data(data):
    """Validate input data against input schema.
    
    Returns:
        tuple: (is_valid: bool, errors: list)
    """
    errors = []
    
    if not input_schema:
        # If schema not available, do basic validation
        return True, []
    
    required_fields = input_schema.get('required', [])
    properties = input_schema.get('properties', {})
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            errors.append({
                'field': field,
                'error': f'Missing required field: {field}',
                'type': 'missing_field'
            })
            continue
        
        # Validate field properties
        prop_def = properties.get(field, {})
        field_value = data[field]
        
        # Type validation
        expected_type = prop_def.get('type')
        if expected_type:
            if expected_type == 'integer' and not isinstance(field_value, (int, np.integer)):
                try:
                    int(field_value)
                except (ValueError, TypeError):
                    errors.append({
                        'field': field,
                        'error': f'Invalid data type for {field}. Expected integer, got {type(field_value).__name__}',
                        'type': 'type_error',
                        'expected': 'integer',
                        'got': type(field_value).__name__
                    })
                    continue
            elif expected_type == 'string' and not isinstance(field_value, str):
                errors.append({
                    'field': field,
                    'error': f'Invalid data type for {field}. Expected string, got {type(field_value).__name__}',
                    'type': 'type_error',
                    'expected': 'string',
                    'got': type(field_value).__name__
                })
                continue
        
        # Enum validation (categorical values)
        allowed_values = prop_def.get('enum', [])
        if allowed_values and field_value not in allowed_values:
            errors.append({
                'field': field,
                'error': f'Invalid value for {field}. Expected one of {allowed_values}, got "{field_value}"',
                'type': 'enum_error',
                'allowed_values': allowed_values,
                'got': field_value
            })
            continue
        
        # Range validation for integers
        if expected_type == 'integer':
            min_val = prop_def.get('minimum')
            max_val = prop_def.get('maximum')
            int_value = int(field_value)
            
            if min_val is not None and int_value < min_val:
                errors.append({
                    'field': field,
                    'error': f'{field} must be >= {min_val}, got {int_value}',
                    'type': 'range_error',
                    'minimum': min_val,
                    'got': int_value
                })
                continue
            
            if max_val is not None and int_value > max_val:
                errors.append({
                    'field': field,
                    'error': f'{field} must be <= {max_val}, got {int_value}',
                    'type': 'range_error',
                    'maximum': max_val,
                    'got': int_value
                })
    
    return len(errors) == 0, errors

def extract_top_factors(X_array, top_n=5):
    """Extract top factors (feature importance) for the prediction.
    
    Args:
        X_array: Input feature array
        top_n: Number of top factors to return
        
    Returns:
        list: Top factors with feature name, input value, and importance score
    """
    top_factors = []
    
    # Try to get feature importance from model
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        expected_columns = ['gender', 'Partner', 'Dependents', 'tenure', 'PhoneService',
                           'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
                           'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
                           'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges',
                           'TotalCharges', 'SeniorCitizen']
        
        # Get top feature indices by importance
        top_indices = np.argsort(importances)[-top_n:][::-1]
        
        for idx in top_indices:
            if idx < len(expected_columns):
                feature_name = expected_columns[idx]
                importance = float(importances[idx])
                feature_value = X_array[0][idx] if idx < len(X_array[0]) else None
                
                top_factors.append({
                    'feature': feature_name,
                    'value': feature_value,
                    'impact': round(importance, 4)
                })
    
    return top_factors




@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    
    Enhanced prediction endpoint with input validation and DSS-ready response format.
    
    Expected input (JSON):
    {
      "tenure": 12,
      "MonthlyCharges": 75.0,
      "TotalCharges": 900.0,
      "SeniorCitizen": 0,
      "gender": "Male",
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
      "PaperlessBilling": "No",
      "PaymentMethod": "Electronic check"
    }
    
    Returns (success):
    {
      "success": true,
      "churn_probability": 0.82,
      "risk_level": "HIGH",
      "recommendation": "Offer 10% discount + free premium services for 3 months",
      "priority": "URGENT",
      "top_factors": [
        { "feature": "tenure", "value": 12, "impact": 0.25 },
        { "feature": "MonthlyCharges", "value": 75.0, "impact": 0.18 },
        ...
      ]
    }
    
    Returns (error):
    {
      "success": false,
      "error": "Invalid input data",
      "details": [
        {
          "field": "tenure",
          "error": "tenure must be >= 0, got -5",
          "type": "range_error",
          "got": -5,
          "minimum": 0
        }
      ]
    }
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not available. Please run train_model.py first.',
            'hint': 'Run: python train_model.py'
        }), 503
    
    try:
        # Parse request JSON
        data = request.json
        if not data:
            return jsonify({
                'success': False, 
                'error': 'Empty request body'
            }), 400
        
        print(f'[predict] Received input data: {list(data.keys())}')
        
        # Validate input data
        is_valid, validation_errors = validate_input_data(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': 'Invalid input data',
                'details': validation_errors
            }), 400
        
        # Convert data to DataFrame
        df_input = pd.DataFrame([data.copy()])
        
        # Encode categorical features using the loaded label encoders
        if label_encoders:
            print(f'[predict] Encoding categorical features using label encoders...')
            for col in df_input.columns:
                if col in label_encoders:
                    le = label_encoders[col]
                    try:
                        # Convert string value to encoded numeric value
                        df_input[col] = le.transform(df_input[col].astype(str))
                        print(f'  ✓ Encoded {col}: {data[col]} → {df_input[col].iloc[0]}')
                    except ValueError as e:
                        print(f'  [WARNING] Could not encode {col} = {data[col]}: {e}')
                        # If value not in training data, use first class as fallback
                        df_input[col] = le.transform([le.classes_[0]])[0]
                        print(f'  [FALLBACK] Used default value: {le.classes_[0]}')
        else:
            print(f'[predict] WARNING: Label encoders not loaded, using hardcoded mappings as fallback')
            # Categorical mappings for string-to-numeric conversion (fallback only)
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
                'PaymentMethod': {
                    'Electronic check': 0, 
                    'Mailed check': 1, 
                    'Bank transfer (automatic)': 2, 
                    'Credit card (automatic)': 3
                },
            }
            
            # Convert categorical string values to numeric
            for key in df_input.columns:
                if key in categorical_mappings and isinstance(df_input[key].iloc[0], str):
                    mapping = categorical_mappings[key]
                    df_input[key] = df_input[key].map(mapping)
        
        # Define expected columns (matching training data order)
        expected_columns = [
            'gender', 'Partner', 'Dependents', 'tenure', 'PhoneService',
            'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
            'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
            'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges',
            'TotalCharges', 'SeniorCitizen'
        ]
        
        # Reorder and fill missing columns with 0
        for col in expected_columns:
            if col not in df_input.columns:
                df_input[col] = 0
        
        # Select only expected columns in correct order
        df_input = df_input[expected_columns]
        
        # Ensure all columns are numeric
        df_input = df_input.astype(float)
        
        # Scale ALL numeric features using scaler (must match training pipeline)
        if scaler is not None:
            try:
                # Transform data while preserving column names
                # Get feature names that scaler knows about
                scaler_features = scaler.get_feature_names_out() if hasattr(scaler, 'get_feature_names_out') else expected_columns
                
                # Transform with proper feature names
                scaled_data = scaler.transform(df_input[expected_columns].values)
                df_input = pd.DataFrame(scaled_data, columns=scaler_features)
                print(f'[predict] Scaled data shape: {df_input.shape}, columns: {list(df_input.columns)}')
            except Exception as scale_error:
                print(f'[predict] Scaler warning (continuing): {scale_error}')
        
        # Use DataFrame directly for prediction to preserve feature names
        # This prevents sklearn warnings about missing feature names
        try:
            # Predict using DataFrame (sklearn 1.3+ supports this)
            prob_predictions = model.predict_proba(df_input)
            churn_prob = float(prob_predictions[0][1])  # Probability of churn (class 1)
            print(f'[predict] Predicted churn probability: {churn_prob}')
        except Exception as pred_error:
            # Fallback to numpy array if DataFrame prediction fails
            print(f'[predict] DataFrame prediction failed, trying numpy: {pred_error}')
            X = df_input.values
            prob_predictions = model.predict_proba(X)
            churn_prob = float(prob_predictions[0][1])
            print(f'[predict] Predicted churn probability (numpy fallback): {churn_prob}')
        
        # Get recommendation
        decision = get_recommendation(churn_prob)
        
        # Extract top factors (feature importance)
        X = df_input.values
        top_factors = extract_top_factors(X, top_n=5)
        
        return jsonify({
            'success': True,
            'churn_probability': round(churn_prob, 4),
            'risk_level': decision['risk_level'],
            'recommendation': decision['recommendation'],
            'priority': decision['priority'],
            'top_factors': top_factors
        }), 200
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f'[predict] Error: {error_trace}')
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 500


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
