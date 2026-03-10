"""
Complete ML Pipeline Orchestrator
Run all steps: data loading → cleaning → EDA → training → evaluation
"""

import subprocess
import sys
import os

def run_step(script_name, description):
    """Run a Python script and handle errors."""
    print(f"\n{'='*70}")
    print(f"STEP: {description}")
    print(f"{'='*70}\n")
    
    try:
        result = subprocess.run([sys.executable, script_name], check=True, cwd=os.path.dirname(__file__) or '.')
        print(f"\n✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ {description} failed with error code {e.returncode}")
        return False

def main():
    """Execute full ML pipeline."""
    print("\n" + "="*70)
    print("CUSTOMER CHURN PREDICTION - COMPLETE ML PIPELINE")
    print("="*70)
    
    steps = [
        ('data_preprocessing.py', 'Data Loading & Cleaning'),
        ('eda_analysis.py', 'Exploratory Data Analysis (EDA)'),
        ('train_model.py', 'Model Training (Logistic Regression, Decision Tree, Random Forest)'),
        ('evaluate_model.py', 'Model Evaluation & Visualization'),
    ]
    
    for script, description in steps:
        if not run_step(script, description):
            print(f"\nPipeline stopped at: {description}")
            print(f"Fix the error and retry, or run '{script}' manually for details.")
            return False
    
    print("\n" + "="*70)
    print("✓ ALL STEPS COMPLETED SUCCESSFULLY")
    print("="*70)
    print("\nGenerated artifacts:")
    print("  - clean_dataset.csv: Cleaned & preprocessed data")
    print("  - model.pkl: Trained model (best: Random Forest/Decision Tree)")
    print("  - scaler.pkl: Feature scaler")
    print("  - eda_charts/: EDA visualizations & report")
    print("  - evaluation_results/: Model evaluation charts & report")
    print("\nNext: Start prediction API")
    print("  python predict_api.py")
    print("\nOr integrate with backend:")
    print("  Backend calls: http://localhost:5000/predict")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
