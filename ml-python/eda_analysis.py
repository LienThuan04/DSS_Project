"""
Exploratory Data Analysis (EDA) Module
- Analyze churn distribution
- Generate charts: pie, bar, histogram, box plot
- Churn patterns by gender, contract, internet service, tenure, charges
- Save visualizations
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

CLEAN_DATA_PATH = 'clean_dataset.csv'
OUTPUT_DIR = 'eda_charts'

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_clean_data():
    """Load cleaned dataset."""
    if not os.path.exists(CLEAN_DATA_PATH):
        print(f"ERROR: {CLEAN_DATA_PATH} not found. Run data_preprocessing.py first.")
        return None
    df = pd.read_csv(CLEAN_DATA_PATH)
    print(f"Loaded clean dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def set_style():
    """Set visualization style."""
    sns.set_style("whitegrid")
    plt.rcParams['figure.figsize'] = (12, 6)

def plot_churn_distribution(df):
    """Pie chart: Churn vs Non-Churn."""
    if 'Churn' not in df.columns:
        print("Churn column not found")
        return
    
    fig, ax = plt.subplots(figsize=(8, 6))
    churn_counts = df['Churn'].value_counts()
    labels = ['Non-Churn', 'Churn']
    colors = ['#66bb6a', '#ef5350']
    ax.pie(churn_counts, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
    ax.set_title('Customer Churn Distribution', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, '01_churn_distribution_pie.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Saved: churn distribution pie chart")

def plot_churn_by_contract(df):
    """Bar chart: Churn by Contract."""
    if 'Contract' not in df.columns or 'Churn' not in df.columns:
        print("Contract or Churn column not found")
        return
    
    # Reverse mapping for readability (assuming LabelEncoder was used)
    # Contract: 0=Month-to-month, 1=One year, 2=Two year
    contract_map = {0: 'Month-to-month', 1: 'One year', 2: 'Two year'}
    
    fig, ax = plt.subplots(figsize=(10, 6))
    df_temp = df.copy()
    df_temp['Contract_Name'] = df_temp['Contract'].map(lambda x: contract_map.get(x, f'Type {x}'))
    
    churn_by_contract = df_temp.groupby('Contract_Name')['Churn'].apply(lambda x: (x.sum() / len(x) * 100)).sort_values(ascending=False)
    churn_by_contract.plot(kind='bar', ax=ax, color='#29b6f6')
    ax.set_title('Churn Rate by Contract Type', fontsize=14, fontweight='bold')
    ax.set_xlabel('Contract Type')
    ax.set_ylabel('Churn Rate (%)')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, '02_churn_by_contract_bar.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Saved: churn by contract bar chart")

def plot_churn_by_internet_service(df):
    """Bar chart: Churn by InternetService."""
    if 'InternetService' not in df.columns or 'Churn' not in df.columns:
        print("InternetService or Churn column not found")
        return
    
    internet_map = {0: 'DSL', 1: 'Fiber optic', 2: 'No'}
    
    fig, ax = plt.subplots(figsize=(10, 6))
    df_temp = df.copy()
    df_temp['InternetService_Name'] = df_temp['InternetService'].map(lambda x: internet_map.get(x, f'Type {x}'))
    
    churn_by_internet = df_temp.groupby('InternetService_Name')['Churn'].apply(lambda x: (x.sum() / len(x) * 100)).sort_values(ascending=False)
    churn_by_internet.plot(kind='bar', ax=ax, color='#ab47bc')
    ax.set_title('Churn Rate by Internet Service Type', fontsize=14, fontweight='bold')
    ax.set_xlabel('Internet Service')
    ax.set_ylabel('Churn Rate (%)')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, '03_churn_by_internet_service_bar.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Saved: churn by internet service bar chart")

def plot_tenure_distribution(df):
    """Histogram: Tenure distribution."""
    if 'tenure' not in df.columns:
        print("tenure column not found")
        return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(df['tenure'], bins=30, color='#26a69a', edgecolor='black', alpha=0.7)
    ax.set_title('Customer Tenure Distribution', fontsize=14, fontweight='bold')
    ax.set_xlabel('Tenure (months)')
    ax.set_ylabel('Number of Customers')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, '04_tenure_histogram.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Saved: tenure distribution histogram")

def plot_monthly_charges_vs_churn(df):
    """Box plot: MonthlyCharges vs Churn."""
    if 'MonthlyCharges' not in df.columns or 'Churn' not in df.columns:
        print("MonthlyCharges or Churn column not found")
        return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    df_temp = df.copy()
    df_temp['Churn_Label'] = df_temp['Churn'].map({0: 'No', 1: 'Yes'})
    
    sns.boxplot(data=df_temp, x='Churn_Label', y='MonthlyCharges', ax=ax, palette='Set2')
    ax.set_title('Monthly Charges Distribution by Churn Status', fontsize=14, fontweight='bold')
    ax.set_xlabel('Churn')
    ax.set_ylabel('Monthly Charges ($)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, '05_monthly_charges_vs_churn_box.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Saved: monthly charges vs churn box plot")

def generate_eda_report(df):
    """Generate text EDA report."""
    report = []
    report.append("=" * 60)
    report.append("EXPLORATORY DATA ANALYSIS (EDA) REPORT")
    report.append("=" * 60)
    
    # Churn summary
    if 'Churn' in df.columns:
        churn_count = df['Churn'].sum()
        total = len(df)
        churn_rate = (churn_count / total) * 100
        report.append(f"\nCHURN SUMMARY:")
        report.append(f"  Total customers: {total}")
        report.append(f"  Churned customers: {churn_count}")
        report.append(f"  Churn rate: {churn_rate:.2f}%")
    
    # Numeric features summary
    report.append(f"\nNUMERIC FEATURES SUMMARY:")
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    for col in numeric_cols:
        if col != 'Churn':
            report.append(f"\n  {col}:")
            report.append(f"    Mean: {df[col].mean():.2f}")
            report.append(f"    Median: {df[col].median():.2f}")
            report.append(f"    Std Dev: {df[col].std():.2f}")
            report.append(f"    Min: {df[col].min():.2f}")
            report.append(f"    Max: {df[col].max():.2f}")
    
    report.append("\n" + "=" * 60)
    report.append("END OF EDA REPORT")
    report.append("=" * 60)
    
    # Write to file
    with open(os.path.join(OUTPUT_DIR, 'EDA_Report.txt'), 'w') as f:
        f.write('\n'.join(report))
    
    print("✓ Saved: EDA report text file")
    print('\n'.join(report))

def main():
    """Main EDA pipeline."""
    df = load_clean_data()
    if df is None:
        return
    
    print("\n===== Generating EDA Charts & Analysis =====")
    set_style()
    
    plot_churn_distribution(df)
    plot_churn_by_contract(df)
    plot_churn_by_internet_service(df)
    plot_tenure_distribution(df)
    plot_monthly_charges_vs_churn(df)
    generate_eda_report(df)
    
    print(f"\n✓ All charts saved to {OUTPUT_DIR}/")
    print("===== EDA Complete =====")

if __name__ == '__main__':
    main()
