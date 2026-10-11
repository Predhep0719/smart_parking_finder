# Smart College Parking Space Finder

A Data Science and Machine Learning web application developed for college mini projects. It analyzes institutional parking capacity data, trains a **Random Forest Regressor** to predict total facility parking capacity based on property features, and explores statistical associations across property types, geographical locations, building statuses, and ownership models.

> **Important Data Science Principle:** This project models **Total Parking Capacity** (structural size), not real-time parking vacancy. Historical CSV datasets cannot indicate live spot availability without dedicated physical sensors (ultrasonic/cameras/gates). A dedicated simulation module is included to demonstrate the hardware calculation equation.

---

## Folder Structure

```
python_college_project/
│
├── Parking Data.csv               # Primary dataset (1,312 records)
├── app.py                         # Flask application & HTTP routes
├── ml_pipeline.py                 # Scikit-learn Pipeline & Random Forest model
├── requirements.txt               # Python package dependencies
├── run_windows.bat                # 1-click Windows runner script
├── README.md                      # Academic documentation & setup instructions
│
├── templates/                     # Jinja2 HTML templates
│   ├── base.html                  # Responsive layout with sidebar & dark navy theme
│   ├── dashboard.html             # Key metrics, category comparisons, and charts
│   ├── dataset.html               # Quality audit, filters, and CSV export
│   ├── model_performance.html     # MAE, MSE, RMSE, R², and validation table
│   ├── factor_analysis.html       # Feature associations and statistics
│   ├── predict.html               # Interactive capacity inference form
│   ├── monitor.html               # Simulated gate telemetry sandbox
│   └── about.html                 # Academic project documentation
│
└── static/
    └── css/
        └── custom.css             # Dark navy styling with blue/cyan accents
```

---

## Dataset Overview

- **Filename:** `Parking Data.csv`
- **Rows:** 1,312 records
- **Features ($X$):**
  - `Bldg City` (Categorical, 274 cities)
  - `Bldg State` (Categorical, 10 states)
  - `Bldg Status` (Categorical: ACTIVE, DECOMMISSIONED, EXCESS)
  - `Property Type` (Categorical: BUILDING, STRUCTURE, LAND)
  - `Owned/Leased` (Categorical: OWNED, LEASED)
- **Target Variable ($y$):**
  - `Total Parking Spaces` (Continuous numerical, Range: 0 to 1,688)

---

## How to Run on Windows (Step-by-Step)

### Option 1: 1-Click Batch Script
Double-click `run_windows.bat`. It will automatically:
1. Verify Python is installed.
2. Create a virtual environment (`venv`).
3. Install packages from `requirements.txt`.
4. Launch the web server on `http://127.0.0.1:5000`.

### Option 2: Manual Command Prompt / PowerShell
1. Open Command Prompt or PowerShell in the `python_college_project` directory.
2. Create and activate a virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```cmd
   python app.py
   ```
5. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## Machine Learning Pipeline Details

1. **Train/Test Split:** 80% training set (n=1,049), 20% holdout test set (n=263) with seed `42` to prevent data leakage.
2. **Preprocessing:** `OneHotEncoder(handle_unknown='ignore')` inside a Scikit-learn `ColumnTransformer`. Safely handles unobserved test or user input categories without throwing runtime exceptions.
3. **Model:** `RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)`. Captures non-linear feature interactions without manual polynomial expansion.
4. **Evaluation Metrics:**
   - **MAE (Mean Absolute Error):** Average magnitude of absolute space deviation.
   - **RMSE (Root Mean Squared Error):** Square root of MSE, penalizing large outliers.
   - **MSE (Mean Squared Error):** Average squared residuals.
   - **R² Score:** Coefficient of determination measuring proportion of variance explained by features.
   *(Note: Classification accuracy is scientifically invalid for regression and is not used).*

---

## Troubleshooting Common Errors

| Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `FileNotFoundError: Parking Data.csv` | CSV is missing from the directory. | Ensure `Parking Data.csv` is placed in the same folder as `app.py`. |
| `ModuleNotFoundError: No module named 'flask'` | Dependencies not installed in active venv. | Run `pip install -r requirements.txt` after activating `venv`. |
| `python is not recognized as an internal or external command` | Python is not added to the system PATH. | Re-run the Python installer, check **"Add Python to PATH"**, and restart the terminal. |
| Port 5000 already in use | Another application or previous Flask instance is running on port 5000. | Change `port=5000` to `port=5001` at the bottom of `app.py`. |
