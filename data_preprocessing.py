"""
Data Preprocessing Module
- Load CSV
- Clean missing values
- Convert Yes/No to binary
- Encode categorical features
- Save cleaned dataset and encoders
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os

CSV_PATH = os.path.join('..', 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
OUTPUT_PATH = 'clean_dataset.csv'
ENCODERS_PATH = 'label_encoders.pkl'

def load_data():
    """Load raw dataset."""
    print(f"Loading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} rows, {len(df.columns)} columns")
    return df

def inspect_data(df):
    """Inspect dataset structure and missing values."""
    print("\n===== Dataset Info =====")
    print(f"Shape: {df.shape}")
    print(f"\nFirst 5 rows:\n{df.head()}")
    print(f"\nColumn dtypes:\n{df.dtypes}")
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nBasic stats:\n{df.describe()}")

def clean_data(df):
    """Clean dataset: handle nulls, convert types, encode categorical."""
    print("\n===== Data Cleaning =====")
    
    # Create copy
    df_clean = df.copy()
    
    # 1. Drop customerID if present (not needed for ML)
    if 'customerID' in df_clean.columns:
        df_clean = df_clean.drop(columns=['customerID'])
        print("✓ Dropped customerID")
    
    # 2. Convert TotalCharges to numeric (may have spaces)
    if 'TotalCharges' in df_clean.columns:
        df_clean['TotalCharges'] = pd.to_numeric(df_clean['TotalCharges'], errors='coerce')
        # Fill NaN with median
        df_clean['TotalCharges'].fillna(df_clean['TotalCharges'].median(), inplace=True)
        print("✓ Converted TotalCharges to numeric, filled NaN with median")
    
    # 3. Convert Yes/No columns to binary (0/1)
    yes_no_cols = ['Partner', 'Dependents', 'PhoneService', 'OnlineSecurity', 
                   'OnlineBackup', 'DeviceProtection', 'TechSupport', 
                   'StreamingTV', 'StreamingMovies', 'PaperlessBilling', 'Churn']
    for col in yes_no_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].map({'Yes': 1, 'No': 0})
    print(f"✓ Converted {len(yes_no_cols)} Yes/No columns to binary")
    
    # 3.5. Fill remaining NaN values in Yes/No columns with 0 (no service)
    for col in yes_no_cols:
        if col in df_clean.columns and df_clean[col].isnull().sum() > 0:
            df_clean[col].fillna(0, inplace=True)
    print("✓ Filled remaining NaN in Yes/No columns with 0")
    
    # 4. SeniorCitizen already numeric (0/1) — ensure it
    if 'SeniorCitizen' in df_clean.columns:
        df_clean['SeniorCitizen'] = df_clean['SeniorCitizen'].astype(int)
    
    # 5. Encode categorical features (Contract, InternetService, PaymentMethod, gender, etc.)
    categorical_cols = df_clean.select_dtypes(include=['object']).columns.tolist()
    print(f"\nEncoding categorical columns: {categorical_cols}")
    
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df_clean[col] = le.fit_transform(df_clean[col].astype(str))
        label_encoders[col] = le
        print(f"  ✓ {col}: {dict(enumerate(le.classes_))}")
    
    # 6. Check for remaining nulls
    print(f"\nRemaining null values:\n{df_clean.isnull().sum()}")
    
    return df_clean, label_encoders

def save_cleaned_dataset(df_clean, encoders):
    """Save cleaned dataset to CSV and encoders to pickle file."""
    df_clean.to_csv(OUTPUT_PATH, index=False)
    print(f"\n✓ Saved cleaned dataset to {OUTPUT_PATH}")
    
    # Save label encoders for use in predict_api.py
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"✓ Saved label encoders to {ENCODERS_PATH}")

def main():
    """Main preprocessing pipeline."""
    df = load_data()
    inspect_data(df)
    df_clean, encoders = clean_data(df)
    save_cleaned_dataset(df_clean, encoders)
    print("\n===== Preprocessing Complete =====")
    return df_clean, encoders

if __name__ == '__main__':
    df_clean, encoders = main()
