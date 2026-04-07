"""
Model Evaluation Module
- Load trained model
- Evaluate on test set
- Generate confusion matrix visualization
- Feature importance analysis
- Cross-validation
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc
from sklearn.model_selection import cross_val_score
import joblib
import os

CLEAN_DATA_PATH = 'clean_dataset.csv'
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'
OUTPUT_DIR = 'evaluation_results'

os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_model_and_data():
    """Load trained model, scaler, and data."""
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: {MODEL_PATH} not found. Run train_model.py first.")
        return None, None, None, None, None
    
    if not os.path.exists(CLEAN_DATA_PATH):
        print(f"ERROR: {CLEAN_DATA_PATH} not found. Run data_preprocessing.py first.")
        return None, None, None, None, None
    
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    
    df = pd.read_csv(CLEAN_DATA_PATH)
    X = df.drop(columns=['Churn'], errors='ignore')
    y = df['Churn'] if 'Churn' in df.columns else None
    
    if y is None:
        print("ERROR: Churn column not found in dataset")
        return None, None, None, None, None
    
    print(f"✓ Loaded model from {MODEL_PATH}")
    print(f"✓ Loaded data: {X.shape[0]} rows, {X.shape[1]} features")
    
    return model, scaler, X, y, df

def scale_data(X, scaler):
    """Apply scaler to data."""
    if scaler is None:
        return X
    
    X_scaled = X.copy()
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
    X_scaled[numeric_cols] = scaler.transform(X[numeric_cols])
    return X_scaled

def plot_confusion_matrix(y_true, y_pred, model_name):
    """Generate and save confusion matrix visualization."""
    cm = confusion_matrix(y_true, y_pred)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax, 
                xticklabels=['No Churn', 'Churn'],
                yticklabels=['No Churn', 'Churn'])
    ax.set_title(f'Confusion Matrix - {model_name}', fontsize=14, fontweight='bold')
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    
    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, f'confusion_matrix_{model_name.replace(" ", "_")}.png')
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Saved: {filepath}")
    return cm

def plot_feature_importance(model, X, model_name):
    """Generate and save feature importance visualization."""
    if not hasattr(model, 'feature_importances_'):
        print(f"Model {model_name} does not support feature importance")
        return
    
    importances = model.feature_importances_
    feature_names = X.columns
    
    # Top 15 features
    indices = np.argsort(importances)[-15:][::-1]
    top_features = feature_names[indices]
    top_importances = importances[indices]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.barh(range(len(top_features)), top_importances, color='#2196f3')
    ax.set_yticks(range(len(top_features)))
    ax.set_yticklabels(top_features)
    ax.set_xlabel('Importance Score')
    ax.set_title(f'Top 15 Feature Importance - {model_name}', fontsize=14, fontweight='bold')
    ax.invert_yaxis()
    
    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, f'feature_importance_{model_name.replace(" ", "_")}.png')
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Saved: {filepath}")

def plot_roc_curve(y_true, y_pred_proba, model_name):
    """Generate and save ROC curve."""
    fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot(fpr, tpr, color='#2196f3', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    ax.plot([0, 1], [0, 1], color='gray', lw=2, linestyle='--', label='Random Classifier')
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('False Positive Rate')
    ax.set_ylabel('True Positive Rate')
    ax.set_title(f'ROC Curve - {model_name}', fontsize=14, fontweight='bold')
    ax.legend(loc="lower right")
    
    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, f'roc_curve_{model_name.replace(" ", "_")}.png')
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Saved: {filepath}")
    return roc_auc

def generate_evaluation_report(model, X, y, model_name):
    """Generate comprehensive evaluation report."""
    X_scaled = scale_data(X, None)  # Will use global scaler if needed
    
    y_pred = model.predict(X_scaled)
    y_pred_proba = model.predict_proba(X_scaled)[:, 1]
    
    report_text = []
    report_text.append("=" * 70)
    report_text.append(f"MODEL EVALUATION REPORT - {model_name}")
    report_text.append("=" * 70)
    
    # Classification report
    class_report = classification_report(y, y_pred, target_names=['No Churn', 'Churn'])
    report_text.append("\nCLASSIFICATION REPORT:")
    report_text.append(class_report)
    
    # ROC AUC
    roc_auc = auc(*roc_curve(y, y_pred_proba)[:2])
    report_text.append(f"\nROC-AUC Score: {roc_auc:.4f}")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='f1')
    report_text.append(f"\n5-Fold Cross-Validation F1 Scores:")
    report_text.append(f"  Mean: {cv_scores.mean():.4f}")
    report_text.append(f"  Std Dev: {cv_scores.std():.4f}")
    report_text.append(f"  Individual folds: {[f'{s:.4f}' for s in cv_scores]}")
    
    report_text.append("\n" + "=" * 70)
    
    report_str = "\n".join(report_text)
    
    # Save report
    filepath = os.path.join(OUTPUT_DIR, f'evaluation_report_{model_name.replace(" ", "_")}.txt')
    with open(filepath, 'w') as f:
        f.write(report_str)
    
    print(f"✓ Saved report: {filepath}")
    print(report_str)

def main():
    """Main evaluation pipeline."""
    print("\n===== Model Evaluation =====\n")
    
    model, scaler, X, y, df = load_model_and_data()
    if model is None:
        return
    
    # Scale data if scaler is available
    X_scaled = scale_data(X, scaler)
    
    # Get predictions
    y_pred = model.predict(X_scaled)
    y_pred_proba = model.predict_proba(X_scaled)[:, 1]
    
    # Get model name
    model_name = model.__class__.__name__
    
    print(f"\n===== Evaluating {model_name} =====")
    
    # Plot confusion matrix
    cm = plot_confusion_matrix(y, y_pred, model_name)
    print(f"Confusion Matrix:\n{cm}")
    
    # Plot feature importance (if supported)
    plot_feature_importance(model, X, model_name)
    
    # Plot ROC curve
    roc_auc = plot_roc_curve(y, y_pred_proba, model_name)
    
    # Generate detailed report
    generate_evaluation_report(model, X, y, model_name)
    
    print(f"\n✓ All evaluation results saved to {OUTPUT_DIR}/")
    print("===== Evaluation Complete =====")

if __name__ == '__main__':
    main()
