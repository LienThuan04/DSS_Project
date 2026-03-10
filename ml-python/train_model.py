"""
Machine Learning Model Training Module
- Feature engineering (scaling, selection)
- Train 3 models: Logistic Regression, Random Forest, Decision Tree
- Evaluate with accuracy, precision, recall, F1, confusion matrix
- Save best model (Random Forest typically best for this task)
- Compare models and export results
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
from sklearn.model_selection import KFold
import joblib
import os
from datetime import datetime
import json

CLEAN_DATA_PATH = 'clean_dataset.csv'
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'
ENCODERS_PATH = 'label_encoders.pkl'
EVALUATION_DIR = 'evaluation_results'
MODEL_COMPARISON_PATH = os.path.join(EVALUATION_DIR, 'model_comparison.csv')
MODEL_COMPARISON_JSON_PATH = os.path.join(EVALUATION_DIR, 'model_comparison.json')
CV_RESULTS_PATH = os.path.join(EVALUATION_DIR, 'cv_results.json')

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

def analyze_class_balance(y):
    """Analyze and report class imbalance in target variable."""
    print("\n===== Class Balance Analysis =====")
    
    class_counts = y.value_counts()
    class_ratios = y.value_counts(normalize=True) * 100
    
    print(f"\nClass Distribution:")
    for class_label in class_counts.index:
        count = class_counts[class_label]
        ratio = class_ratios[class_label]
        print(f"  {class_label}: {count} samples ({ratio:.2f}%)")
    
    # Calculate imbalance ratio
    sorted_counts = sorted(class_counts.values)
    imbalance_ratio = sorted_counts[-1] / sorted_counts[0]
    
    print(f"\nImbalance Ratio (majority/minority): {imbalance_ratio:.2f}")
    
    if imbalance_ratio > 3:
        print("⚠️  Significant class imbalance detected (ratio > 3)")
        print("   Using class_weight='balanced' to mitigate imbalance")
        return True
    else:
        print("✓ Class balance is acceptable (ratio < 3)")
        return False

def train_logistic_regression(X_train, y_train, use_balanced_weights=False):
    """Train Logistic Regression model."""
    print("\n[1] Training Logistic Regression...")
    model = LogisticRegression(
        max_iter=1000, 
        random_state=42,
        class_weight='balanced' if use_balanced_weights else None
    )
    model.fit(X_train, y_train)
    print("✓ Logistic Regression trained")
    return model

def train_decision_tree(X_train, y_train, use_balanced_weights=False):
    """Train Decision Tree model."""
    print("\n[2] Training Decision Tree...")
    model = DecisionTreeClassifier(
        max_depth=10, 
        random_state=42,
        class_weight='balanced' if use_balanced_weights else None
    )
    model.fit(X_train, y_train)
    print("✓ Decision Tree trained")
    return model

def train_random_forest(X_train, y_train, use_balanced_weights=False):
    """Train Random Forest model."""
    print("\n[3] Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=100, 
        max_depth=10, 
        random_state=42,
        n_jobs=-1,
        class_weight='balanced' if use_balanced_weights else None
    )
    model.fit(X_train, y_train)
    print("✓ Random Forest trained")
    return model

def evaluate_model(model, X_train, X_test, y_train, y_test, model_name):
    """Evaluate model on train and test sets."""
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Probability predictions for ROC-AUC (if available)
    try:
        y_test_proba = model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_test_proba)
    except:
        auc_score = None
    
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
    if auc_score is not None:
        print(f"AUC-ROC:        {auc_score:.4f}")
    print(f"CV Accuracy (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"Confusion Matrix:\n{cm}")
    
    return {
        'name': model_name,
        'train_acc': train_acc,
        'test_acc': test_acc,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'auc_roc': auc_score,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std(),
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

def export_model_comparison(results):
    """Export model comparison results to CSV and JSON."""
    # Create evaluation directory if it doesn't exist
    os.makedirs(EVALUATION_DIR, exist_ok=True)
    
    # Prepare data for CSV
    comparison_data = []
    for result in results:
        comparison_data.append({
            'Model': result['name'],
            'Train Accuracy': f"{result['train_acc']:.4f}",
            'Test Accuracy': f"{result['test_acc']:.4f}",
            'Precision': f"{result['precision']:.4f}",
            'Recall': f"{result['recall']:.4f}",
            'F1 Score': f"{result['f1']:.4f}",
            'AUC-ROC': f"{result['auc_roc']:.4f}" if result['auc_roc'] else "N/A",
            'CV Accuracy (Mean)': f"{result['cv_mean']:.4f}",
            'CV Accuracy (Std)': f"{result['cv_std']:.4f}",
        })
    
    # Export as CSV
    comparison_df = pd.DataFrame(comparison_data)
    comparison_df.to_csv(MODEL_COMPARISON_PATH, index=False)
    print(f"\n✓ Model comparison exported to {MODEL_COMPARISON_PATH}")
    
    # Export as JSON for programmatic access
    json_data = {
        'timestamp': datetime.now().isoformat(),
        'models': []
    }
    
    for result in results:
        json_data['models'].append({
            'name': result['name'],
            'metrics': {
                'train_accuracy': float(result['train_acc']),
                'test_accuracy': float(result['test_acc']),
                'precision': float(result['precision']),
                'recall': float(result['recall']),
                'f1_score': float(result['f1']),
                'auc_roc': float(result['auc_roc']) if result['auc_roc'] else None,
                'cv_accuracy_mean': float(result['cv_mean']),
                'cv_accuracy_std': float(result['cv_std']),
            }
        })
    
    with open(MODEL_COMPARISON_JSON_PATH, 'w') as f:
        json.dump(json_data, f, indent=2)
    print(f"✓ Model comparison (JSON) exported to {MODEL_COMPARISON_JSON_PATH}")

def perform_detailed_cross_validation(model, X_train, y_train, model_name, n_splits=5):
    """Perform detailed k-fold cross-validation with per-fold metrics."""
    print(f"\n===== Cross-Validation Analysis ({n_splits}-fold) for {model_name} =====")
    
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    fold_results = []
    
    for fold, (train_idx, val_idx) in enumerate(kf.split(X_train), 1):
        X_fold_train = X_train.iloc[train_idx]
        X_fold_val = X_train.iloc[val_idx]
        y_fold_train = y_train.iloc[train_idx]
        y_fold_val = y_train.iloc[val_idx]
        
        # Retrain model on this fold's training data
        temp_model = model.__class__(**model.get_params())
        temp_model.fit(X_fold_train, y_fold_train)
        
        # Evaluate on validation set
        y_pred = temp_model.predict(X_fold_val)
        
        fold_metrics = {
            'fold': fold,
            'accuracy': float(accuracy_score(y_fold_val, y_pred)),
            'precision': float(precision_score(y_fold_val, y_pred, zero_division=0)),
            'recall': float(recall_score(y_fold_val, y_pred, zero_division=0)),
            'f1': float(f1_score(y_fold_val, y_pred, zero_division=0)),
        }
        
        # AUC if available
        try:
            y_proba = temp_model.predict_proba(X_fold_val)[:, 1]
            fold_metrics['auc_roc'] = float(roc_auc_score(y_fold_val, y_proba))
        except:
            fold_metrics['auc_roc'] = None
        
        fold_results.append(fold_metrics)
        print(f"\nFold {fold}:")
        print(f"  Accuracy: {fold_metrics['accuracy']:.4f}")
        print(f"  Precision: {fold_metrics['precision']:.4f}")
        print(f"  Recall: {fold_metrics['recall']:.4f}")
        print(f"  F1: {fold_metrics['f1']:.4f}")
        if fold_metrics['auc_roc']:
            print(f"  AUC-ROC: {fold_metrics['auc_roc']:.4f}")
    
    # Calculate statistics
    cv_stats = {
        'model_name': model_name,
        'n_splits': n_splits,
        'timestamp': datetime.now().isoformat(),
        'folds': fold_results,
        'summary': {}
    }
    
    for metric in ['accuracy', 'precision', 'recall', 'f1', 'auc_roc']:
        values = [f[metric] for f in fold_results if f.get(metric) is not None]
        if values:
            cv_stats['summary'][metric] = {
                'mean': float(np.mean(values)),
                'std': float(np.std(values)),
                'min': float(np.min(values)),
                'max': float(np.max(values))
            }
    
    # Print summary
    print(f"\n===== {n_splits}-Fold CV Summary for {model_name} =====")
    for metric, stats in cv_stats['summary'].items():
        print(f"{metric.upper()}:")
        print(f"  Mean: {stats['mean']:.4f} ± {stats['std']:.4f}")
        print(f"  Range: [{stats['min']:.4f}, {stats['max']:.4f}]")
    
    return cv_stats

def export_cv_results(cv_stats):
    """Export cross-validation results to JSON."""
    os.makedirs(EVALUATION_DIR, exist_ok=True)
    
    with open(CV_RESULTS_PATH, 'w') as f:
        json.dump(cv_stats, f, indent=2)
    print(f"\n✓ Cross-validation results exported to {CV_RESULTS_PATH}")

def main():
    """Main training pipeline."""
    print("===== Machine Learning Model Training =====\n")
    
    # Load and prepare data
    X, y = load_clean_data()
    if X is None or y is None:
        return
    
    # Feature engineering
    X_scaled, scaler = feature_engineering(X)
    
    # Analyze class balance
    use_balanced_weights = analyze_class_balance(y)
    
    # Split data
    X_train, X_test, y_train, y_test = split_data(X_scaled, y)
    
    # Train all models
    print("\n===== Training Models =====")
    lr_model = train_logistic_regression(X_train, y_train, use_balanced_weights)
    dt_model = train_decision_tree(X_train, y_train, use_balanced_weights)
    rf_model = train_random_forest(X_train, y_train, use_balanced_weights)
    
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
    
    # Export model comparison
    print("\n===== Model Comparison Export =====")
    export_model_comparison(results)
    
    # Select best model based on F1 score
    best_result = max(results, key=lambda x: x['f1'])
    print(f"\n===== Best Model: {best_result['name']} (F1: {best_result['f1']:.4f}) =====")
    
    # Perform detailed cross-validation on best model
    cv_stats = perform_detailed_cross_validation(best_result['model'], X_train, y_train, best_result['name'])
    export_cv_results(cv_stats)
    
    # Save model and scaler
    save_model(best_result, scaler)
    print("\n===== Training Complete =====")

if __name__ == '__main__':
    main()
