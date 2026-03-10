"""
Machine Learning Model Training Module
- Feature engineering (scaling, selection)
- Train 3 models: Logistic Regression, Random Forest, Decision Tree
- Evaluate with accuracy, precision, recall, F1, confusion matrix
- Save best model (Random Forest typically best for this task)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os

CLEAN_DATA_PATH = 'clean_dataset.csv'
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'

def load_clean_data():
    """Load cleaned dataset from preprocessing."""
    if not os.path.exists(CLEAN_DATA_PATH):
        print(f"ERROR: {CLEAN_DATA_PATH} not found. Run data_preprocessing.py first.")
        return None, None
    
    df = pd.read_csv(CLEAN_DATA_PATH)
    print(f"Loaded clean dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Separate features and target
    X = df.drop(columns=['Churn'], errors='ignore')
    y = df['Churn'] if 'Churn' in df.columns else None
    
    if y is None:
        print("ERROR: Churn column not found in dataset")
        return None, None
    
    return X, y

def feature_engineering(X):
    """Feature scaling for numeric features."""
    print("\n===== Feature Engineering =====")
    
    # Identify numeric columns
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
    print(f"Numeric features ({len(numeric_cols)}): {list(numeric_cols)[:10]}...")
    
    # Scale numeric features
    scaler = StandardScaler()
    X_scaled = X.copy()
    X_scaled[numeric_cols] = scaler.fit_transform(X[numeric_cols])
    
    print(f"✓ Scaled {len(numeric_cols)} numeric features")
    print(f"Features shape: {X_scaled.shape}")
    
    return X_scaled, scaler

def split_data(X, y, test_size=0.2, random_state=42):
    """Split into train/test sets."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    print(f"\nTrain set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    return X_train, X_test, y_train, y_test

def train_logistic_regression(X_train, y_train):
    """Train Logistic Regression model."""
    print("\n[1] Training Logistic Regression...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)
    print("✓ Logistic Regression trained")
    return model

def train_decision_tree(X_train, y_train):
    """Train Decision Tree model."""
    print("\n[2] Training Decision Tree...")
    model = DecisionTreeClassifier(max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    print("✓ Decision Tree trained")
    return model

def train_random_forest(X_train, y_train):
    """Train Random Forest model."""
    print("\n[3] Training Random Forest...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    print("✓ Random Forest trained")
    return model

def evaluate_model(model, X_train, X_test, y_train, y_test, model_name):
    """Evaluate model on train and test sets."""
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Metrics
    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    precision = precision_score(y_test, y_test_pred, zero_division=0)
    recall = recall_score(y_test, y_test_pred, zero_division=0)
    f1 = f1_score(y_test, y_test_pred, zero_division=0)
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_test_pred)
    
    print(f"\n--- {model_name} Results ---")
    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy:  {test_acc:.4f}")
    print(f"Precision:      {precision:.4f}")
    print(f"Recall:         {recall:.4f}")
    print(f"F1 Score:       {f1:.4f}")
    print(f"CV Accuracy (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"Confusion Matrix:\n{cm}")
    
    return {
        'name': model_name,
        'train_acc': train_acc,
        'test_acc': test_acc,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'cv_mean': cv_scores.mean(),
        'model': model
    }

def feature_importance(model, X_train, model_name):
    """Display feature importance if model supports it."""
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feature_names = X_train.columns
        # Top 10 features
        top_indices = np.argsort(importances)[-10:][::-1]
        print(f"\nTop 10 Features for {model_name}:")
        for idx in top_indices:
            print(f"  {feature_names[idx]}: {importances[idx]:.4f}")

def save_model(best_result, scaler):
    """Save best model and scaler."""
    joblib.dump(best_result['model'], MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"\n✓ Best model ({best_result['name']}) saved to {MODEL_PATH}")
    print(f"✓ Scaler saved to {SCALER_PATH}")

def main():
    """Main training pipeline."""
    print("===== Machine Learning Model Training =====\n")
    
    # Load and prepare data
    X, y = load_clean_data()
    if X is None or y is None:
        return
    
    # Feature engineering
    X_scaled, scaler = feature_engineering(X)
    
    # Split data
    X_train, X_test, y_train, y_test = split_data(X_scaled, y)
    
    # Train all models
    print("\n===== Training Models =====")
    lr_model = train_logistic_regression(X_train, y_train)
    dt_model = train_decision_tree(X_train, y_train)
    rf_model = train_random_forest(X_train, y_train)
    
    # Evaluate all models
    print("\n===== Model Evaluation =====")
    results = []
    results.append(evaluate_model(lr_model, X_train, X_test, y_train, y_test, "Logistic Regression"))
    results.append(evaluate_model(dt_model, X_train, X_test, y_train, y_test, "Decision Tree"))
    results.append(evaluate_model(rf_model, X_train, X_test, y_train, y_test, "Random Forest"))
    
    # Feature importance
    print("\n===== Feature Importance =====")
    feature_importance(dt_model, X_train, "Decision Tree")
    feature_importance(rf_model, X_train, "Random Forest")
    
    # Select best model based on F1 score
    best_result = max(results, key=lambda x: x['f1'])
    print(f"\n===== Best Model: {best_result['name']} (F1: {best_result['f1']:.4f}) =====")
    
    # Save model and scaler
    save_model(best_result, scaler)
    print("\n===== Training Complete =====")

if __name__ == '__main__':
    main()
