"""Module huấn luyện mô hình Machine Learning.
Mô-đun này thực hiện các bước: tải dữ liệu đã làm sạch,
tiền xử lý (scale), huấn luyện Decision Tree, đánh giá, cross-validation,
và lưu mô hình/ket qua đánh giá.
"""

# Thư viện xử lý dữ liệu
import pandas as pd
# Thư viện toán học/ma trận
import numpy as np
# Hàm chia dữ liệu và cross validation
from sklearn.model_selection import train_test_split, cross_val_score
# Bộ tiền xử lý để chuẩn hóa dữ liệu
from sklearn.preprocessing import StandardScaler
# Mô hình cây quyết định
from sklearn.tree import DecisionTreeClassifier
# Các chỉ số đánh giá mô hình
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
# KFold để thực hiện cross-validation chi tiết
from sklearn.model_selection import KFold
# Lưu và nạp mô hình nhanh
import joblib
# Tương tác hệ thống (đường dẫn, thư mục)
import os
# Lấy thời gian hiện tại để lưu metadata
from datetime import datetime
# Lưu kết quả dưới dạng JSON
import json

# Đường dẫn tới dữ liệu đã làm sạch
CLEAN_DATA_PATH = 'clean_dataset.csv'
# Đường dẫn file mô hình sẽ lưu
MODEL_PATH = 'model.pkl'
# Đường dẫn file scaler sẽ lưu
SCALER_PATH = 'scaler.pkl'
# (không sử dụng trong mã hiện tại nhưng giữ tên để mở rộng)
ENCODERS_PATH = 'label_encoders.pkl'
# Thư mục chứa kết quả đánh giá
EVALUATION_DIR = 'evaluation_results'
# Đường dẫn file so sánh mô hình (CSV)
MODEL_COMPARISON_PATH = os.path.join(EVALUATION_DIR, 'model_comparison.csv')
# Đường dẫn file so sánh mô hình (JSON)
MODEL_COMPARISON_JSON_PATH = os.path.join(EVALUATION_DIR, 'model_comparison.json')
# Đường dẫn file kết quả cross-validation (JSON)
CV_RESULTS_PATH = os.path.join(EVALUATION_DIR, 'cv_results.json')


def load_clean_data():
    # Hàm tải dữ liệu đã được làm sạch từ file CSV
    if not os.path.exists(CLEAN_DATA_PATH):
        # Nếu file không tồn tại thì thông báo lỗi và trả về None
        print(f"ERROR: {CLEAN_DATA_PATH} not found. Run data_preprocessing.py first.")
        return None, None
    
    # Đọc CSV vào DataFrame
    df = pd.read_csv(CLEAN_DATA_PATH)
    # In kích thước dataset (số hàng, số cột)
    print(f"Loaded clean dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Tách features (X) bằng cách bỏ cột 'Churn' nếu có
    X = df.drop(columns=['Churn'], errors='ignore')
    # Tách target (y) là cột 'Churn' nếu tồn tại, ngược lại None
    y = df['Churn'] if 'Churn' in df.columns else None
    
    # Nếu không có cột target thì báo lỗi
    if y is None:
        print("ERROR: Churn column not found in dataset")
        return None, None
    
    # Trả về X và y
    return X, y


def feature_engineering(X, scaler=None):
    # Hàm tiền xử lý/feature engineering (ở đây chỉ scale các biến số)
    # Nếu scaler được truyền vào thì dùng để transform (cho test set)
    # Nếu scaler=None thì khởi tạo mới và fit (cho train set)
    print("\n===== Feature Engineering =====")
    
    # Chọn các cột số nguyên/số thực (numeric)
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
    # In một số cột numeric để kiểm tra
    print(f"Numeric features ({len(numeric_cols)}): {list(numeric_cols)[:10]}...")
    
    # Sao chép DataFrame để không thay đổi gốc
    X_scaled = X.copy()
    
    # Nếu scaler chưa được khởi tạo thì tạo mới (và fit trên train set)
    if scaler is None:
        scaler = StandardScaler()
        # ✓ FIX: fit_transform chỉ trên TRAIN set để tránh data leakage
        X_scaled[numeric_cols] = scaler.fit_transform(X[numeric_cols])
        print(f"✓ Scaler fitted and scaled {len(numeric_cols)} numeric features")
    else:
        # Nếu scaler đã được fit, chỉ transform (cho test set hoặc validation set)
        X_scaled[numeric_cols] = scaler.transform(X[numeric_cols])
        print(f"✓ Scaled {len(numeric_cols)} numeric features using fitted scaler")
    
    # In kích thước của features sau scale
    print(f"Features shape: {X_scaled.shape}")
    
    # Trả về dữ liệu đã scale và object scaler để lưu lại
    return X_scaled, scaler


def split_data(X, y, test_size=0.2, random_state=42):
    # Hàm chia dữ liệu thành train và test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    # In số mẫu train
    print(f"\nTrain set: {X_train.shape[0]} samples")
    # In số mẫu test
    print(f"Test set: {X_test.shape[0]} samples")
    # Trả về bộ chia
    return X_train, X_test, y_train, y_test


def analyze_class_balance(y):
    # Hàm phân tích tỷ lệ lớp trong biến mục tiêu để kiểm tra imbalance
    print("\n===== Class Balance Analysis =====")
    
    # Đếm số mẫu theo từng lớp
    class_counts = y.value_counts()
    # Tính tỷ lệ phần trăm theo lớp
    class_ratios = y.value_counts(normalize=True) * 100
    
    # In phân phối lớp
    print(f"\nClass Distribution:")
    for class_label in class_counts.index:
        count = class_counts[class_label]
        ratio = class_ratios[class_label]
        print(f"  {class_label}: {count} samples ({ratio:.2f}%)")
    
    # Tính tỷ lệ imbalance (majority / minority)
    sorted_counts = sorted(class_counts.values)
    imbalance_ratio = sorted_counts[-1] / sorted_counts[0]
    
    # In tỷ lệ imbalance
    print(f"\nImbalance Ratio (majority/minority): {imbalance_ratio:.2f}")
    
    # Nếu tỷ lệ > 3 thì xem là mất cân bằng đáng kể
    if imbalance_ratio > 3:
        print("⚠️  Significant class imbalance detected (ratio > 3)")
        print("   Using class_weight='balanced' to mitigate imbalance")
        return True
    else:
        print("✓ Class balance is acceptable (ratio < 3)")
        return False


def train_decision_tree(X_train, y_train, use_balanced_weights=False):
    # Hàm huấn luyện mô hình Decision Tree
    print("\nTraining Decision Tree...")
    # Tạo model với max_depth giới hạn để tránh overfitting
    model = DecisionTreeClassifier(
        max_depth=10, 
        random_state=42,
        class_weight='balanced' if use_balanced_weights else None
    )
    # Huấn luyện model trên dữ liệu train
    model.fit(X_train, y_train)
    print("✓ Decision Tree trained")
    return model


def evaluate_model(model, X_train, X_test, y_train, y_test, model_name):
    # Hàm đánh giá model trên train và test set, trả về dictionary kết quả
    # Dự đoán trên tập train
    y_train_pred = model.predict(X_train)
    # Dự đoán trên tập test
    y_test_pred = model.predict(X_test)
    
    # Thử lấy xác suất dự đoán để tính AUC-ROC nếu model hỗ trợ
    try:
        y_test_proba = model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_test_proba)
    except:
        # Nếu không có predict_proba thì bỏ qua AUC
        auc_score = None
    
    # Tính các chỉ số cơ bản
    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    precision = precision_score(y_test, y_test_pred, zero_division=0)
    recall = recall_score(y_test, y_test_pred, zero_division=0)
    f1 = f1_score(y_test, y_test_pred, zero_division=0)
    
    # Cross-validation đơn giản trên tập train để ước lượng độ ổn định
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    
    # Ma trận nhầm lẫn trên tập test
    cm = confusion_matrix(y_test, y_test_pred)
    
    # In kết quả
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
    
    # Trả về kết quả dưới dạng dict để dễ so sánh và lưu
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
    # Nếu mô hình có thuộc tính feature_importances_ thì in ra top feature
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feature_names = X_train.columns
        # Lấy chỉ số 10 feature có ảnh hưởng cao nhất
        top_indices = np.argsort(importances)[-10:][::-1]
        print(f"\nTop 10 Features for {model_name}:")
        for idx in top_indices:
            print(f"  {feature_names[idx]}: {importances[idx]:.4f}")


def save_model(best_result, scaler):
    # Lưu mô hình tốt nhất và scaler vào file bằng joblib
    joblib.dump(best_result['model'], MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"\n✓ Best model ({best_result['name']}) saved to {MODEL_PATH}")
    print(f"✓ Scaler saved to {SCALER_PATH}")


def export_model_comparison(results):
    # Xuất kết quả so sánh các mô hình sang CSV và JSON
    os.makedirs(EVALUATION_DIR, exist_ok=True)
    
    # Chuẩn bị dữ liệu cho CSV
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
    
    # Ghi CSV
    comparison_df = pd.DataFrame(comparison_data)
    comparison_df.to_csv(MODEL_COMPARISON_PATH, index=False)
    print(f"\n✓ Model comparison exported to {MODEL_COMPARISON_PATH}")
    
    # Chuẩn bị JSON để truy xuất chương trình
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
    
    # Ghi JSON
    with open(MODEL_COMPARISON_JSON_PATH, 'w') as f:
        json.dump(json_data, f, indent=2)
    print(f"✓ Model comparison (JSON) exported to {MODEL_COMPARISON_JSON_PATH}")


def perform_detailed_cross_validation(model, X_train, y_train, model_name, n_splits=5):
    # Thực hiện K-Fold CV chi tiết và in thông số cho từng fold
    print(f"\n===== Cross-Validation Analysis ({n_splits}-fold) for {model_name} =====")
    
    # Khởi tạo KFold với shuffle để phân phối ngẫu nhiên
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    fold_results = []
    
    # Lặp qua từng fold
    for fold, (train_idx, val_idx) in enumerate(kf.split(X_train), 1):
        # Tạo tập train/val cho fold này
        X_fold_train = X_train.iloc[train_idx]
        X_fold_val = X_train.iloc[val_idx]
        y_fold_train = y_train.iloc[train_idx]
        y_fold_val = y_train.iloc[val_idx]
        
        # Tái tạo một instance model cùng hyperparams và huấn luyện trên fold
        temp_model = model.__class__(**model.get_params())
        temp_model.fit(X_fold_train, y_fold_train)
        
        # Dự đoán trên validation set của fold
        y_pred = temp_model.predict(X_fold_val)
        
        # Tính các chỉ số cho fold
        fold_metrics = {
            'fold': fold,
            'accuracy': float(accuracy_score(y_fold_val, y_pred)),
            'precision': float(precision_score(y_fold_val, y_pred, zero_division=0)),
            'recall': float(recall_score(y_fold_val, y_pred, zero_division=0)),
            'f1': float(f1_score(y_fold_val, y_pred, zero_division=0)),
        }
        
        # Nếu model cho xác suất, tính AUC cho fold
        try:
            y_proba = temp_model.predict_proba(X_fold_val)[:, 1]
            fold_metrics['auc_roc'] = float(roc_auc_score(y_fold_val, y_proba))
        except:
            fold_metrics['auc_roc'] = None
        
        # Lưu kết quả fold
        fold_results.append(fold_metrics)
        print(f"\nFold {fold}:")
        print(f"  Accuracy: {fold_metrics['accuracy']:.4f}")
        print(f"  Precision: {fold_metrics['precision']:.4f}")
        print(f"  Recall: {fold_metrics['recall']:.4f}")
        print(f"  F1: {fold_metrics['f1']:.4f}")
        if fold_metrics['auc_roc']:
            print(f"  AUC-ROC: {fold_metrics['auc_roc']:.4f}")
    
    # Tổng hợp thống kê cho các fold
    cv_stats = {
        'model_name': model_name,
        'n_splits': n_splits,
        'timestamp': datetime.now().isoformat(),
        'folds': fold_results,
        'summary': {}
    }
    
    # Tính mean/std/min/max cho từng chỉ số nếu có giá trị
    for metric in ['accuracy', 'precision', 'recall', 'f1', 'auc_roc']:
        values = [f[metric] for f in fold_results if f.get(metric) is not None]
        if values:
            cv_stats['summary'][metric] = {
                'mean': float(np.mean(values)),
                'std': float(np.std(values)),
                'min': float(np.min(values)),
                'max': float(np.max(values))
            }
    
    # In tóm tắt CV
    print(f"\n===== {n_splits}-Fold CV Summary for {model_name} =====")
    for metric, stats in cv_stats['summary'].items():
        print(f"{metric.upper()}:")
        print(f"  Mean: {stats['mean']:.4f} ± {stats['std']:.4f}")
        print(f"  Range: [{stats['min']:.4f}, {stats['max']:.4f}]")
    
    # Trả về dict chứa chi tiết CV
    return cv_stats


def export_cv_results(cv_stats):
    # Xuất kết quả cross-validation ra file JSON
    os.makedirs(EVALUATION_DIR, exist_ok=True)
    
    with open(CV_RESULTS_PATH, 'w') as f:
        json.dump(cv_stats, f, indent=2)
    print(f"\n✓ Cross-validation results exported to {CV_RESULTS_PATH}")


def main():
    # Hàm pipeline chính để chạy toàn bộ quy trình huấn luyện
    print("===== Machine Learning Model Training =====\n")
    
    # Tải dữ liệu
    X, y = load_clean_data()
    if X is None or y is None:
        # Nếu tải dữ liệu thất bại thì dừng chương trình
        return
    
    # Split data TRƯỚC feature engineering để tránh data leakage
    X_train, X_test, y_train, y_test = split_data(X, y)
    
    # Kiểm tra imbalance để quyết định có dùng class_weight hay không
    use_balanced_weights = analyze_class_balance(y)
    
    # ✓ FIX: Fit scaler chỉ trên TRAIN set
    print("\n===== Scaling Features =====")
    X_train_scaled, scaler = feature_engineering(X_train, scaler=None)
    
    # ✓ FIX: Transform TEST set dùng scaler đã fit từ train set
    X_test_scaled, _ = feature_engineering(X_test, scaler=scaler)
    
    # Huấn luyện mô hình (ở đây chỉ dùng Decision Tree)
    print("\n===== Training Model =====")
    dt_model = train_decision_tree(X_train_scaled, y_train, use_balanced_weights)
    
    # Đánh giá mô hình
    print("\n===== Model Evaluation =====")
    results = []
    results.append(evaluate_model(dt_model, X_train_scaled, X_test_scaled, y_train, y_test, "Decision Tree"))
    
    # In feature importance nếu có
    print("\n===== Feature Importance =====")
    feature_importance(dt_model, X_train_scaled, "Decision Tree")
    
    # Chọn mô hình tốt nhất (hiện tại chỉ có 1 mô hình)
    best_result = results[0]
    print(f"\n===== Selected Model: {best_result['name']} (F1: {best_result['f1']:.4f}) =====")
    
    # Thực hiện detailed CV trên mô hình đã chọn và lưu kết quả
    cv_stats = perform_detailed_cross_validation(best_result['model'], X_train_scaled, y_train, best_result['name'])
    export_cv_results(cv_stats)
    
    # Lưu mô hình và scaler
    save_model(best_result, scaler)
    print("\n===== Training Complete =====")


if __name__ == '__main__':
    # Entry point: chạy main khi file được chạy trực tiếp
    main()
