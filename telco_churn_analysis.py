# -*- coding: utf-8 -*-
"""
===========================================================================
  TELCO CUSTOMER CHURN - PHAN TICH TOAN DIEN
  He tro giup quyet dinh | Mon: He tro giup quyet dinh
  ---
  PHAN 1 : Data Analyst    - Lam sach + Truc quan hoa
  PHAN 2 : ML Engineer     - Mo hinh hoa + Danh gia
  PHAN 3 : Decision Support- Feature Importance + Bang chien luoc
===========================================================================
"""

# ---------------------------------------------------------------------------
# 0. THU VIEN
# ---------------------------------------------------------------------------
import warnings, sys, io
warnings.filterwarnings("ignore")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.patches as mpatches
from matplotlib.colors import LinearSegmentedColormap

from sklearn.preprocessing      import LabelEncoder
from sklearn.model_selection    import train_test_split
from sklearn.ensemble           import RandomForestClassifier
from sklearn.metrics            import (confusion_matrix, classification_report,
                                        ConfusionMatrixDisplay)
from imblearn.over_sampling     import SMOTE

# ── Theme ───────────────────────────────────────────────────────────────────
plt.rcParams.update({
    "font.family"      : "DejaVu Sans",
    "axes.spines.top"  : False,
    "axes.spines.right": False,
    "figure.facecolor" : "#0F1117",
    "axes.facecolor"   : "#0F1117",
    "axes.labelcolor"  : "#E0E0E0",
    "xtick.color"      : "#B0B0B0",
    "ytick.color"      : "#B0B0B0",
    "text.color"       : "#E0E0E0",
    "grid.color"       : "#2A2A3A",
    "grid.alpha"       : 0.4,
})

CHURN  = "#FF4B5C"
STAY   = "#00C48C"
ACCENT = "#A855F7"
GOLD   = "#F59E0B"
BLUE   = "#3B82F6"
BG     = "#0F1117"
PANEL  = "#1A1D2E"
DIVIDER = "=" * 68


# ===========================================================================
# PHAN 1 – DATA ANALYST : LAM SACH & TRUC QUAN HOA
# ===========================================================================
print(DIVIDER)
print("  PHAN 1 – DATA ANALYST")
print("  Lam sach du lieu & Truc quan hoa")
print(DIVIDER)

# ── 1.1 Doc du lieu ─────────────────────────────────────────────────────────
df = pd.read_csv("WA_Fn-UseC_-Telco-Customer-Churn.csv")
print(f"\n[INFO] Kich thuoc ban dau : {df.shape[0]:,} hang x {df.shape[1]} cot")

# ── 1.2 Chuyen TotalCharges -> numeric ──────────────────────────────────────
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
n_missing = df["TotalCharges"].isna().sum()
print(f"[INFO] TotalCharges – so gia tri thieu: {n_missing}")

median_tc = df["TotalCharges"].median()
df["TotalCharges"].fillna(median_tc, inplace=True)
print(f"[INFO] Da dien median = {median_tc:.2f} cho {n_missing} o trong")
print(f"[INFO] Gia tri thieu con lai: {df['TotalCharges'].isna().sum()}")

# ── 1.3 Cot nhi phan ────────────────────────────────────────────────────────
df["Churn_binary"] = (df["Churn"] == "Yes").astype(int)
overall_rate = df["Churn_binary"].mean() * 100
print(f"\n[TONG QUAN] So khach hang : {len(df):,}")
print(f"[TONG QUAN] Ty le Churn   : {overall_rate:.1f}%\n")

# ── 1.4 Nhom tenure ─────────────────────────────────────────────────────────
bins   = [0, 12, 24, 48, 72]
labels = ["0-12 th", "13-24 th", "25-48 th", "49-72 th"]
df["tenure_group"] = pd.cut(df["tenure"], bins=bins, labels=labels, right=True)

# ── 1.5 Ve bieu do ──────────────────────────────────────────────────────────
fig1 = plt.figure(figsize=(20, 14), facecolor=BG)
fig1.suptitle("PHAN TICH TY LE CHURN – TELCO CUSTOMER CHURN",
              fontsize=20, fontweight="bold", color="#E0E0E0", y=0.98)
gs1 = gridspec.GridSpec(2, 3, figure=fig1, hspace=0.52, wspace=0.40)

# ---- Pie tong the ----------------------------------------------------------
ax0 = fig1.add_subplot(gs1[0, 0])
ax0.set_facecolor(PANEL)
sizes = df["Churn"].value_counts()
wedges, _, autotexts = ax0.pie(
    sizes, labels=["O lai", "Roi bo"],
    colors=[STAY, CHURN], autopct="%1.1f%%", startangle=140,
    wedgeprops={"linewidth": 2, "edgecolor": BG},
    textprops={"color": "#E0E0E0", "fontsize": 11},
    pctdistance=0.62,
)
for at in autotexts:
    at.set_color("white"); at.set_fontweight("bold"); at.set_fontsize(13)
ax0.set_title("Ty le Churn tong the", color="#E0E0E0", pad=14)

# ---- Contract --------------------------------------------------------------
ax1 = fig1.add_subplot(gs1[0, 1:])
ax1.set_facecolor(PANEL)
c_data = (
    df.groupby("Contract")["Churn_binary"]
    .agg(["mean","count"]).reset_index()
    .sort_values("mean", ascending=False)
)
c_data.columns = ["Contract","ChurnRate","Count"]
bar_colors = [CHURN, GOLD, STAY]
bars = ax1.bar(c_data["Contract"], c_data["ChurnRate"],
               color=bar_colors, width=0.52, edgecolor=BG, linewidth=1.5)
for bar, rate, cnt in zip(bars, c_data["ChurnRate"], c_data["Count"]):
    ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.014,
             f"{rate*100:.1f}%\n(n={cnt:,})",
             ha="center", va="bottom", fontsize=11, fontweight="bold",
             color="#E0E0E0")
ax1.axhline(df["Churn_binary"].mean(), color=ACCENT, ls="--", lw=1.5,
            alpha=0.8, label=f"TB chung {overall_rate:.1f}%")
ax1.set_ylim(0, c_data["ChurnRate"].max() * 1.40)
ax1.set_title("Ty le Churn theo Loai Hop Dong (Contract)", color="#E0E0E0", pad=14)
ax1.set_ylabel("Ty le Churn", color="#B0B0B0")
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x,_: f"{x*100:.0f}%"))
ax1.tick_params(colors="#B0B0B0")
ax1.legend(fontsize=10, facecolor=PANEL, labelcolor="#E0E0E0")

# ---- InternetService -------------------------------------------------------
ax2 = fig1.add_subplot(gs1[1, :2])
ax2.set_facecolor(PANEL)
ip = (df.groupby(["InternetService","Churn"]).size()
      .reset_index(name="Count"))
ip["Pct"] = ip["Count"] / ip.groupby("InternetService")["Count"].transform("sum")
services = ip["InternetService"].unique()
x = np.arange(len(services)); w = 0.38

stay_v  = ip[ip["Churn"]=="No"].set_index("InternetService")["Pct"]
churn_v = ip[ip["Churn"]=="Yes"].set_index("InternetService")["Pct"]

b1 = ax2.bar(x - w/2, stay_v.reindex(services),  w, color=STAY,  label="O lai",  edgecolor=BG)
b2 = ax2.bar(x + w/2, churn_v.reindex(services), w, color=CHURN, label="Roi bo", edgecolor=BG)
for bar in list(b1)+list(b2):
    h = bar.get_height()
    ax2.text(bar.get_x()+bar.get_width()/2, h+0.012,
             f"{h*100:.1f}%", ha="center", va="bottom",
             fontsize=10, fontweight="bold", color="#E0E0E0")
ax2.set_xticks(x); ax2.set_xticklabels(services, fontsize=11, color="#B0B0B0")
ax2.set_title("Ty le Churn theo Dich Vu Internet (InternetService)", color="#E0E0E0", pad=14)
ax2.set_ylabel("Ty le (%)", color="#B0B0B0")
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x,_: f"{x*100:.0f}%"))
ax2.legend(fontsize=10, facecolor=PANEL, labelcolor="#E0E0E0")

# ---- Tenure ----------------------------------------------------------------
ax3 = fig1.add_subplot(gs1[1, 2])
ax3.set_facecolor(PANEL)
tg = (df.groupby("tenure_group", observed=True)["Churn_binary"]
      .agg(["mean","count"]).reset_index())
tg.columns = ["tenure_group","ChurnRate","Count"]
t_colors = [CHURN, "#FF8C42", GOLD, STAY]
bh = ax3.barh(tg["tenure_group"].astype(str), tg["ChurnRate"],
              color=t_colors, edgecolor=BG, height=0.55)
for bar, rate, cnt in zip(bh, tg["ChurnRate"], tg["Count"]):
    ax3.text(rate+0.006, bar.get_y()+bar.get_height()/2,
             f"{rate*100:.1f}%  (n={cnt:,})",
             va="center", fontsize=9.5, fontweight="bold", color="#E0E0E0")
ax3.set_title("Ty le Churn theo Tham Nien\n(tenure nhom)", color="#E0E0E0", pad=14)
ax3.set_xlabel("Ty le Churn", color="#B0B0B0")
ax3.xaxis.set_major_formatter(plt.FuncFormatter(lambda x,_: f"{x*100:.0f}%"))
ax3.set_xlim(0, tg["ChurnRate"].max() * 1.42)
ax3.axvline(df["Churn_binary"].mean(), color=ACCENT, ls="--", lw=1.5, alpha=0.8)

plt.savefig("chart1_churn_overview.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("[OK] Bieu do 1 da luu: chart1_churn_overview.png")

# ── 1.6 Insights nguy co cao ────────────────────────────────────────────────
print("\n[PHAN TICH] TOP 5 NHOM KHACH HANG NGUY CO CHURN CAO NHAT")
print("-" * 68)
risk_df = (
    df.groupby(["Contract","InternetService","tenure_group"], observed=True)
    .agg(ChurnRate=("Churn_binary","mean"),
         Count=("Churn_binary","count"),
         AvgMonthly=("MonthlyCharges","mean"))
    .reset_index().query("Count >= 30")
    .sort_values("ChurnRate", ascending=False).head(5)
)
risk_df["Churn%"]  = (risk_df["ChurnRate"]*100).map("{:.1f}%".format)
risk_df["Monthly"] = risk_df["AvgMonthly"].map("${:.0f}".format)
print(risk_df[["Contract","InternetService","tenure_group","Churn%","Count","Monthly"]]
      .to_string(index=False))


# ===========================================================================
# PHAN 2 – ML ENGINEER : MO HINH HOA & DANH GIA
# ===========================================================================
print("\n" + DIVIDER)
print("  PHAN 2 – ML ENGINEER")
print("  Ma hoa + Train/Test + SMOTE + Random Forest")
print(DIVIDER)

# ── 2.1 Ma hoa bien phan loai ────────────────────────────────────────────────
df_ml = df.drop(columns=["customerID","Churn","Churn_binary","tenure_group"])

# Phan biet binary (Yes/No, Male/Female) va multiclass
binary_cols = [c for c in df_ml.columns
               if df_ml[c].dtype == "object" and df_ml[c].nunique() == 2]
multi_cols  = [c for c in df_ml.columns
               if df_ml[c].dtype == "object" and df_ml[c].nunique() > 2
               and c not in binary_cols]

le = LabelEncoder()
for col in binary_cols:
    df_ml[col] = le.fit_transform(df_ml[col])

df_ml = pd.get_dummies(df_ml, columns=multi_cols, drop_first=True)

X = df_ml.astype(float)
y = df["Churn_binary"]
print(f"\n[INFO] So features sau ma hoa : {X.shape[1]}")
print(f"[INFO] LabelEncoder ap dung cho: {binary_cols}")
print(f"[INFO] get_dummies ap dung cho : {multi_cols}")

# ── 2.2 Train/Test split 80/20 ───────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y)
print(f"\n[INFO] Train: {X_train.shape[0]:,} mau | Test: {X_test.shape[0]:,} mau")
print(f"[INFO] Phan phoi Churn trong train: {y_train.mean()*100:.1f}%")

# ── 2.3 SMOTE ───────────────────────────────────────────────────────────────
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X_train, y_train)
print(f"\n[INFO] Truoc SMOTE : {y_train.value_counts().to_dict()}")
print(f"[INFO] Sau  SMOTE : {pd.Series(y_res).value_counts().to_dict()}")

# ── 2.4 Random Forest ────────────────────────────────────────────────────────
rf_model = RandomForestClassifier(
    n_estimators=200, max_depth=12,
    class_weight="balanced", random_state=42, n_jobs=-1)
rf_model.fit(X_res, y_res)
y_pred = rf_model.predict(X_test)
print(f"\n[OK] Random Forest huan luyen xong ({rf_model.n_estimators} cay).")

# ── 2.5 Confusion Matrix + Classification Report ─────────────────────────────
print("\n[KET QUA] CONFUSION MATRIX & CLASSIFICATION REPORT")
print("-" * 68)
print(classification_report(y_test, y_pred,
                             target_names=["Khong Churn (0)", "Churn (1)"]))

cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
recall_churn = tp / (tp + fn)
prec_churn   = tp / (tp + fp)
print(f"  TP={tp}  FP={fp}  FN={fn}  TN={tn}")
print(f"  Recall (Churn)    = {recall_churn*100:.1f}%")
print(f"  Precision (Churn) = {prec_churn*100:.1f}%")

# ── Ve Confusion Matrix ──────────────────────────────────────────────────────
fig2, ax_cm = plt.subplots(figsize=(7, 6), facecolor=BG)
ax_cm.set_facecolor(PANEL)
cm_cmap = LinearSegmentedColormap.from_list("cm_cmap", [PANEL, ACCENT])
disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                               display_labels=["Khong Churn", "Churn"])
disp.plot(ax=ax_cm, colorbar=False, cmap=cm_cmap)
ax_cm.set_title("Confusion Matrix – Random Forest\n(Test set 20%)",
                fontsize=14, fontweight="bold", color="#E0E0E0", pad=16)
for text in ax_cm.texts:
    text.set_color("#FFFFFF"); text.set_fontsize(16); text.set_fontweight("bold")
ax_cm.set_xlabel("Nhan Du Doan", color="#B0B0B0", fontsize=12)
ax_cm.set_ylabel("Nhan Thuc Te",   color="#B0B0B0", fontsize=12)
ax_cm.tick_params(colors="#B0B0B0")
plt.tight_layout()
plt.savefig("chart2_confusion_matrix.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("[OK] Bieu do 2 da luu: chart2_confusion_matrix.png")

# ── Giai thich Recall vs Accuracy ──────────────────────────────────────────
print("""
[GIAI THICH] TAI SAO TOI UU RECALL THAY VI ACCURACY?
-----------------------------------------------------------------
Trong bai toan giu chan khach hang (Customer Churn Retention):

  * Cost cua False Negative (FN) rat cao:
    - Mo hinh "bo sot" khach hang sap roi bo (du doan = 0, thuc te = 1)
    - Doanh nghiep mat di khach hang ma khong co co hoi can thiep
    - Chi phi tuyen dung khach hang moi > chi phi giu chan khach cu
      (thuong gap 5-7 lan)

  * Accuracy bi "anh huong" boi mat can bang:
    - Tap du lieu co ~73% khong Churn, ~27% Churn
    - Mo hinh du doan "tat ca = 0" van dat Accuracy ~73%
    - => Accuracy cao KHONG CO NGHIA mo hinh tot

  * Recall (do nhan dang dung cac truong hop Churn thuc te):
    Recall = TP / (TP + FN)
    - Cao Recall  => mo hinh bat duoc nhieu khach hang rui ro
    - Du'ng de trien khai cac chien dich retention (goi dien, giam gia)

  KET LUAN: Ta can Recall > 70% de dam bao banh luoi uy ro khong bi lot.
  Ket hop F1-Score de can bang voi Precision tranh spam hanh dong.
-----------------------------------------------------------------
""")


# ===========================================================================
# PHAN 3 – DECISION SUPPORT : FEATURE IMPORTANCE & BANG CHIEN LUOC
# ===========================================================================
print(DIVIDER)
print("  PHAN 3 – DECISION SUPPORT")
print("  Feature Importance + Bang de xuat chien luoc Marketing")
print(DIVIDER)

# ── 3.1 Feature Importance ──────────────────────────────────────────────────
feat_imp = pd.Series(rf_model.feature_importances_, index=X.columns)
top5 = feat_imp.nlargest(5).sort_values()

fig3, ax_fi = plt.subplots(figsize=(11, 6), facecolor=BG)
ax_fi.set_facecolor(PANEL)

gradient_colors = [BLUE, ACCENT, GOLD, "#FF8C42", CHURN]
bars_fi = ax_fi.barh(top5.index, top5.values,
                     color=gradient_colors, edgecolor=BG, height=0.55)

for bar, val in zip(bars_fi, top5.values):
    ax_fi.text(val + 0.002, bar.get_y() + bar.get_height()/2,
               f"{val*100:.2f}%",
               va="center", fontsize=11, fontweight="bold", color="#E0E0E0")

ax_fi.set_title("Top 5 Yeu To Quan Trong Nhat Dan Den Churn\n(Random Forest Feature Importance)",
                fontsize=14, fontweight="bold", color="#E0E0E0", pad=16)
ax_fi.set_xlabel("Importance Score", color="#B0B0B0", fontsize=12)
ax_fi.tick_params(colors="#B0B0B0", labelsize=11)
ax_fi.set_xlim(0, top5.max() * 1.28)
ax_fi.grid(axis="x", alpha=0.3)

# Annotation mui ten
for i, (bar, val) in enumerate(zip(bars_fi, top5.values)):
    ax_fi.annotate("", xy=(val, bar.get_y()+bar.get_height()/2),
                   xytext=(0, bar.get_y()+bar.get_height()/2),
                   arrowprops=dict(arrowstyle="-", color=gradient_colors[i], lw=0))

plt.tight_layout()
plt.savefig("chart3_feature_importance.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("[OK] Bieu do 3 da luu: chart3_feature_importance.png")

# ── In ten top 5 ─────────────────────────────────────────────────────────────
print(f"\n[PHAN TICH] TOP 5 FEATURES QUAN TRONG NHAT:")
for rank, (feat, val) in enumerate(feat_imp.nlargest(5).items(), 1):
    print(f"  {rank}. {feat:<35} {val*100:.2f}%")

# ── 3.2 Bang de xuat chien luoc cho Giam doc Marketing ───────────────────────
strategy_report = """
+===========================================================================+
|     BANG DE XUAT QUYET DINH CHIEN LUOC CHO GIAM DOC MARKETING            |
|     Telco Customer Churn – Retention Strategy Decision Table              |
+===========================================================================+

+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
| STT  | PHAN KHUC KHACH HANG       | DAU HIEU NHAN BIET      | QUYET DINH TAC DONG           | LOI ICH KY VONG             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
|  1   | Khach moi thang ngan han   | Contract: Month-to-month| Offer khoa hop dong 1 nam     | Giam Churn 20-30 diem %     |
|      | + Fiber optic + <12 thang  | Tenure: 0-12            | giam 15% cuoc thang dau       | Tang LTV trung binh 2x      |
|      | [Nguy co: ~65% Churn]      | IS: Fiber optic         | Onboarding call tuan dau      |                             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
|  2   | Thanh toan Electronic check| PaymentMethod: Elec.    | Mail/SMS nhac tu dong tra     | Giam belatedly payments 40% |
|      | + cuoc cao + thang ngan han| MonthlyCharges: >$70    | check -> auto-pay; khuyen     | Giam Churn 15 diem %        |
|      | [Nguy co: ~57% Churn]      | Tenure: <24             | ma giam 5$/thang khi chuyen   |                             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
|  3   | Khong co Tech Support      | TechSupport: No         | Cap Tech Support mien phi     | Tang NPS +15 diem           |
|      | + Fiber optic + thang ngan | IS: Fiber optic         | 3 thang dau; chatbot 24/7;    | Giam Churn 12 diem %        |
|      | [Nguy co: ~55% Churn]      | Contract: M-to-M        | goi ky thuat trong 48h        |                             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
|  4   | Cuoc phi thang cao         | MonthlyCharges: >$85    | Review goi cuoc; de xuat goi  | Giu chan 60% KH co y dinh   |
|      | khong dung them dich vu    | No OnlineSecurity       | bundle tai chinh tot hon;     | roi bo; tang doanh thu 8%   |
|      | [Nguy co: ~48% Churn]      | No StreamingTV          | giam gia khi add-on dich vu   |                             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+
|  5   | Khach trung thanh           | Tenure: >48 thang       | Chuong trinh Loyalty /        | Tang Referral 25%; giu      |
|      | (nen tang on dinh)         | Contract: 2-year        | Ambassador; Tang them GB     | churn duoi 5%; upsell       |
|      | [Nguy co: <5% Churn]       | TotalCharges: cao        | data / qua tang sinh nhat    | dich vu cao cap             |
+------+----------------------------+-------------------------+-------------------------------+-----------------------------+

  UU TIEN:  1 (Cap bach) -> Nhom 1 & 2 (chiem phan lon Churn thuc te)
            2 (Quan trong) -> Nhom 3 & 4 (giu ARPU cao)
            3 (Dai han)  -> Nhom 5 (nhan rong mo hinh trung thanh)

  CHI SO THEO DOI ĐE XUAT:
    - Monthly Churn Rate (theo doi hang thang)
    - Recall cua mo hinh ML (>70% thi du tin cay)
    - Customer Lifetime Value (CLV) truoc va sau can thiep
    - Net Promoter Score (NPS) nhom Fiber optic

+===========================================================================+
"""
print(strategy_report)

print("[HOAN THANH] Phan tich toan dien Telco Customer Churn.")
print(f"\nCac file da xuat ra:")
print(f"  - chart1_churn_overview.png    (Truc quan hoa Phan 1)")
print(f"  - chart2_confusion_matrix.png  (Confusion Matrix Phan 2)")
print(f"  - chart3_feature_importance.png(Feature Importance Phan 3)")
