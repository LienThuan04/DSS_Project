"""
Complete ML Pipeline Orchestrator
Run all steps: data loading → cleaning → EDA → training → evaluation
Usage: python run_pipeline.py
Output: clean_dataset.csv, model.pkl, scaler.pkl, evaluation_results/, eda_charts/
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def ensure_directories():
    """Create necessary output directories."""
    dirs = ['eda_charts', 'evaluation_results', 'models']
    for dir_name in dirs:
        Path(dir_name).mkdir(exist_ok=True)
        print(f"✓ Directory ensured: {dir_name}/")

def run_step(script_name, description):
    """Run a Python script and handle errors."""
    print(f"\n{'='*70}")
    print(f"STEP: {description}")
    print(f"Script: {script_name}")
    print(f"{'='*70}\n")
    
    start_time = time.time()
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            check=True,
            cwd=os.path.dirname(__file__) or '.'
        )
        elapsed = time.time() - start_time
        print(f"\n✓ {description} completed successfully ({elapsed:.2f}s)")
        return True
    except subprocess.CalledProcessError as e:
        elapsed = time.time() - start_time
        print(f"\n✗ {description} failed with error code {e.returncode} ({elapsed:.2f}s)")
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error in {description}: {str(e)}")
        return False

def verify_outputs():
    """Verify that all expected output files were generated."""
    print(f"\n{'='*70}")
    print("Verifying output artifacts...")
    print(f"{'='*70}\n")
    
    required_files = [
        'clean_dataset.csv',
        'model.pkl',
        'scaler.pkl',
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.exists(file):
            size = os.path.getsize(file) / 1024  # KB
            print(f"✓ {file} ({size:.1f} KB)")
        else:
            print(f"✗ {file} (MISSING)")
            all_exist = False
    
    # Check directories
    dirs_to_check = ['eda_charts', 'evaluation_results']
    for dir_name in dirs_to_check:
        if os.path.isdir(dir_name):
            files = len(os.listdir(dir_name))
            print(f"✓ {dir_name}/ ({files} files)")
        else:
            print(f"✗ {dir_name}/ (MISSING)")
            all_exist = False
    
    return all_exist

def main():
    """Execute full ML pipeline."""
    print("\n" + "="*70)
    print("CUSTOMER CHURN PREDICTION - ML PIPELINE ORCHESTRATOR")
    print("="*70)
    print(f"Current directory: {os.getcwd()}")
    
    # Ensure output directories exist
    ensure_directories()
    
    # Define pipeline steps
    steps = [
        ('data_preprocessing.py', 'Step 1/4: Data Loading & Cleaning'),
        ('eda_analysis.py', 'Step 2/4: Exploratory Data Analysis (EDA)'),
        ('train_model.py', 'Step 3/4: Model Training (Logistic Regression, Decision Tree, Random Forest)'),
        ('evaluate_model.py', 'Step 4/4: Model Evaluation & Report Generation'),
    ]
    
    pipeline_start = time.time()
    
    # Execute each step
    for script, description in steps:
        if not run_step(script, description):
            print(f"\n{'='*70}")
            print(f"PIPELINE INTERRUPTED")
            print(f"{'='*70}")
            print(f"\nFailed at: {description}")
            print(f"Fix the error and retry, or run '{script}' manually for details.")
            return False
    
    # Verify outputs
    if verify_outputs():
        total_time = time.time() - pipeline_start
        print(f"\n{'='*70}")
        print("✓ ALL STEPS COMPLETED SUCCESSFULLY")
        print(f"Total time: {total_time:.2f}s")
        print(f"{'='*70}")
        print("\nGenerated artifacts:")
        print("  ✓ clean_dataset.csv — Cleaned & preprocessed data")
        print("  ✓ model.pkl — Trained ML model (best performing)")
        print("  ✓ scaler.pkl — Feature scaler for preprocessing")
        print("  ✓ eda_charts/ — EDA visualizations & analysis")
        print("  ✓ evaluation_results/ — Model metrics & comparisons")
        print("  ✓ evaluation_results/report.json — Machine-readable metrics")
        print("\nNext steps:")
        print("  1. Start prediction API: python predict_api.py")
        print("  2. Or integrate with backend: http://localhost:5000/predict")
        print("  3. Backend will call ML API for predictions")
        return True
    else:
        print(f"\n{'='*70}")
        print("⚠ PIPELINE COMPLETED BUT SOME OUTPUT FILES ARE MISSING")
        print(f"{'='*70}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
