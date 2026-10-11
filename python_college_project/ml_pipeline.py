"""
Smart College Parking Space Finder - Machine Learning Pipeline
Trains a Scikit-Learn RandomForestRegressor inside a robust Pipeline
with OneHotEncoder for categorical features (Bldg City, Bldg State,
Bldg Status, Property Type, Owned/Leased).
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_FILENAME = 'Parking Data.csv'

def find_dataset_path():
    """Locate Parking Data.csv in current directory or parent directory."""
    candidates = [
        DATA_FILENAME,
        os.path.join(os.path.dirname(__file__), DATA_FILENAME),
        os.path.join(os.path.dirname(__file__), '..', DATA_FILENAME),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"Could not locate '{DATA_FILENAME}'. Please ensure it is saved in the project root.")

def load_data(filepath=None):
    """Load and perform data cleaning on Parking Data.csv."""
    if filepath is None:
        filepath = find_dataset_path()
    
    df = pd.read_csv(filepath)
    
    # Strip whitespace from string columns
    str_cols = ['Bldg City', 'Bldg State', 'Bldg Status', 'Property Type', 'Owned/Leased']
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.upper()
    
    # Ensure numeric target
    if 'Total Parking Spaces' in df.columns:
        df['Total Parking Spaces'] = pd.to_numeric(df['Total Parking Spaces'], errors='coerce').fillna(0)
        df['Total Parking Spaces'] = df['Total Parking Spaces'].clip(lower=0)
    
    return df

def get_dataset_stats(df):
    """Compute high-level descriptive and missing value statistics."""
    total_records = len(df)
    missing_dict = df.isnull().sum().to_dict()
    duplicates = df.duplicated().sum()
    
    spaces = df['Total Parking Spaces']
    return {
        'total_records': int(total_records),
        'total_spaces': int(spaces.sum()),
        'avg_spaces': round(float(spaces.mean()), 2),
        'median_spaces': round(float(spaces.median()), 2),
        'min_spaces': int(spaces.min()),
        'max_spaces': int(spaces.max()),
        'std_spaces': round(float(spaces.std()), 2),
        'unique_cities': int(df['Bldg City'].nunique()),
        'unique_states': int(df['Bldg State'].nunique()),
        'unique_statuses': int(df['Bldg Status'].nunique()),
        'unique_types': int(df['Property Type'].nunique()),
        'unique_ownerships': int(df['Owned/Leased'].nunique()),
        'zero_space_count': int((spaces == 0).sum()),
        'zero_space_pct': round(float((spaces == 0).mean() * 100), 2),
        'missing_values': missing_dict,
        'duplicate_count': int(duplicates),
    }

def train_model(df):
    """Train RandomForestRegressor with Scikit-learn Pipeline & Train-Test Split."""
    feature_cols = ['Bldg City', 'Bldg State', 'Bldg Status', 'Property Type', 'Owned/Leased']
    target_col = 'Total Parking Spaces'
    
    X = df[feature_cols]
    y = df[target_col]
    
    # 80/20 train/test split with seed 42 to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Handle unknown categories safely via handle_unknown='ignore'
    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, feature_cols)
        ]
    )
    
    # Random Forest Regressor Pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluation on holdout test set
    y_pred = pipeline.predict(X_test)
    y_pred_rounded = np.clip(np.round(y_pred), 0, None)
    
    mae = mean_absolute_error(y_test, y_pred_rounded)
    mse = mean_squared_error(y_test, y_pred_rounded)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred_rounded)
    
    # Validation Table items
    val_df = X_test.copy()
    val_df['Actual'] = y_test.values
    val_df['Predicted'] = y_pred_rounded
    val_df['Absolute_Error'] = np.abs(val_df['Predicted'] - val_df['Actual'])
    
    metrics = {
        'mae': round(float(mae), 2),
        'mse': round(float(mse), 2),
        'rmse': round(float(rmse), 2),
        'r2': round(float(r2), 3),
        'train_count': len(X_train),
        'test_count': len(X_test)
    }
    
    return pipeline, metrics, val_df

def predict_capacity(pipeline, city, state, status, property_type, ownership):
    """Predict parking capacity for a single input record with explanation."""
    input_df = pd.DataFrame([{
        'Bldg City': str(city).strip().upper(),
        'Bldg State': str(state).strip().upper(),
        'Bldg Status': str(status).strip().upper(),
        'Property Type': str(property_type).strip().upper(),
        'Owned/Leased': str(ownership).strip().upper()
    }])
    
    raw_pred = pipeline.predict(input_df)[0]
    predicted_spaces = max(0, int(round(raw_pred)))
    
    explanation = (
        f"The Random Forest model evaluated historical features for a {property_type} in "
        f"{city}, {state} under {ownership} status ({status}). "
        f"It estimated a total structural capacity of {predicted_spaces} spaces based on similar properties."
    )
    
    return predicted_spaces, explanation
