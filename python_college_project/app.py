"""
Smart College Parking Space Finder - Flask Web Application
College Data Science Mini Project
"""

import io
from flask import Flask, render_template, request, Response, jsonify
import pandas as pd
from ml_pipeline import (
    load_data,
    get_dataset_stats,
    train_model,
    predict_capacity
)

app = Flask(__name__)

# Global dataset & trained model cache
df_global = None
stats_global = None
pipeline_global = None
metrics_global = None
val_df_global = None

def init_app():
    global df_global, stats_global, pipeline_global, metrics_global, val_df_global
    try:
        df_global = load_data()
        stats_global = get_dataset_stats(df_global)
        pipeline_global, metrics_global, val_df_global = train_model(df_global)
        print("Data loaded and Random Forest pipeline trained successfully!")
    except Exception as e:
        print(f"Error initializing data/model: {e}")

init_app()

@app.route('/')
def dashboard():
    """Route 1: Dashboard with key summary indicators and category comparisons."""
    if df_global is None:
        init_app()
    
    # State distribution (top 8)
    state_counts = df_global['Bldg State'].value_counts().head(8).to_dict()
    # Property type distribution
    type_counts = df_global['Property Type'].value_counts().to_dict()
    # Ownership distribution
    ownership_counts = df_global['Owned/Leased'].value_counts().to_dict()
    # Status distribution
    status_counts = df_global['Bldg Status'].value_counts().to_dict()

    return render_template(
        'dashboard.html',
        stats=stats_global,
        state_counts=state_counts,
        type_counts=type_counts,
        ownership_counts=ownership_counts,
        status_counts=status_counts,
        active_page='dashboard'
    )

@app.route('/dataset')
def dataset_analysis():
    """Route 2: Dataset analysis with filters, summary statistics, and table preview."""
    if df_global is None:
        init_app()

    filtered_df = df_global.copy()
    
    # Filter parameters
    selected_city = request.args.get('city', '').strip().upper()
    selected_state = request.args.get('state', '').strip().upper()
    selected_type = request.args.get('type', '').strip().upper()
    selected_status = request.args.get('status', '').strip().upper()
    selected_ownership = request.args.get('ownership', '').strip().upper()

    if selected_city and selected_city != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg City'] == selected_city]
    if selected_state and selected_state != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg State'] == selected_state]
    if selected_type and selected_type != 'ALL':
        filtered_df = filtered_df[filtered_df['Property Type'] == selected_type]
    if selected_status and selected_status != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg Status'] == selected_status]
    if selected_ownership and selected_ownership != 'ALL':
        filtered_df = filtered_df[filtered_df['Owned/Leased'] == selected_ownership]

    cities = sorted(df_global['Bldg City'].dropna().unique())
    states = sorted(df_global['Bldg State'].dropna().unique())
    types = sorted(df_global['Property Type'].dropna().unique())
    statuses = sorted(df_global['Bldg Status'].dropna().unique())
    ownerships = sorted(df_global['Owned/Leased'].dropna().unique())

    # Limit preview to 50 rows for performance
    preview_records = filtered_df.head(50).to_dict(orient='records')
    total_matching = len(filtered_df)

    return render_template(
        'dataset.html',
        stats=stats_global,
        records=preview_records,
        total_matching=total_matching,
        cities=cities,
        states=states,
        types=types,
        statuses=statuses,
        ownerships=ownerships,
        selected_city=selected_city,
        selected_state=selected_state,
        selected_type=selected_type,
        selected_status=selected_status,
        selected_ownership=selected_ownership,
        active_page='dataset'
    )

@app.route('/export-csv')
def export_csv():
    """CSV Export route for filtered records."""
    if df_global is None:
        init_app()
    
    filtered_df = df_global.copy()
    selected_city = request.args.get('city', '').strip().upper()
    selected_state = request.args.get('state', '').strip().upper()
    selected_type = request.args.get('type', '').strip().upper()
    selected_status = request.args.get('status', '').strip().upper()
    selected_ownership = request.args.get('ownership', '').strip().upper()

    if selected_city and selected_city != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg City'] == selected_city]
    if selected_state and selected_state != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg State'] == selected_state]
    if selected_type and selected_type != 'ALL':
        filtered_df = filtered_df[filtered_df['Property Type'] == selected_type]
    if selected_status and selected_status != 'ALL':
        filtered_df = filtered_df[filtered_df['Bldg Status'] == selected_status]
    if selected_ownership and selected_ownership != 'ALL':
        filtered_df = filtered_df[filtered_df['Owned/Leased'] == selected_ownership]

    output = io.StringIO()
    filtered_df.to_csv(output, index=False)
    output.seek(0)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=filtered_parking_data.csv"}
    )

@app.route('/model')
def model_performance():
    """Route 3: Model Performance metrics & Actual vs Predicted validation table."""
    if df_global is None or pipeline_global is None:
        init_app()

    validation_preview = val_df_global.head(30).to_dict(orient='records')

    # Accuracy bands
    val = val_df_global
    within_10 = int((val['Absolute_Error'] <= 10).sum())
    within_25 = int((val['Absolute_Error'] <= 25).sum())
    within_50 = int((val['Absolute_Error'] <= 50).sum())
    total_val = len(val)

    bands = {
        'within_10': within_10,
        'within_10_pct': round((within_10 / total_val) * 100, 1),
        'within_25': within_25,
        'within_25_pct': round((within_25 / total_val) * 100, 1),
        'within_50': within_50,
        'within_50_pct': round((within_50 / total_val) * 100, 1),
    }

    return render_template(
        'model_performance.html',
        metrics=metrics_global,
        val_records=validation_preview,
        bands=bands,
        total_test=len(val_df_global),
        active_page='model'
    )

@app.route('/factors')
def factor_analysis():
    """Route 4: Factor Analysis examining relationship with Property Type, Status, Ownership, State."""
    if df_global is None:
        init_app()

    factor = request.args.get('factor', 'Property Type')
    allowed_factors = ['Property Type', 'Bldg Status', 'Owned/Leased', 'Bldg State']
    if factor not in allowed_factors:
        factor = 'Property Type'

    grouped = df_global.groupby(factor)['Total Parking Spaces'].agg(
        count='count',
        mean='mean',
        median='median',
        max='max',
        min='min',
        sum='sum'
    ).reset_index()

    grouped['mean'] = grouped['mean'].round(1)
    grouped['median'] = grouped['median'].round(1)
    grouped = grouped.sort_values(by='count', ascending=False)
    factor_records = grouped.to_dict(orient='records')

    return render_template(
        'factor_analysis.html',
        current_factor=factor,
        allowed_factors=allowed_factors,
        factor_records=factor_records,
        active_page='factors'
    )

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """Route 5: Interactive prediction form."""
    if df_global is None or pipeline_global is None:
        init_app()

    cities = sorted(df_global['Bldg City'].dropna().unique())
    states = sorted(df_global['Bldg State'].dropna().unique())
    types = sorted(df_global['Property Type'].dropna().unique())
    statuses = sorted(df_global['Bldg Status'].dropna().unique())
    ownerships = sorted(df_global['Owned/Leased'].dropna().unique())

    prediction_result = None
    input_data = None
    explanation = None

    if request.method == 'POST':
        city = request.form.get('city', '').strip()
        state = request.form.get('state', '').strip()
        status = request.form.get('status', '').strip()
        property_type = request.form.get('property_type', '').strip()
        ownership = request.form.get('ownership', '').strip()

        input_data = {
            'city': city,
            'state': state,
            'status': status,
            'property_type': property_type,
            'ownership': ownership
        }

        if city and state and status and property_type and ownership:
            pred_spaces, explanation = predict_capacity(
                pipeline_global, city, state, status, property_type, ownership
            )
            prediction_result = pred_spaces

    return render_template(
        'predict.html',
        cities=cities,
        states=states,
        types=types,
        statuses=statuses,
        ownerships=ownerships,
        prediction=prediction_result,
        input_data=input_data,
        explanation=explanation,
        active_page='predict'
    )

@app.route('/monitor', methods=['GET', 'POST'])
def monitor():
    """Route 6: Simulated Parking Occupancy Monitor demo."""
    total_capacity = 100
    occupied = 42

    if request.method == 'POST':
        try:
            total_capacity = max(1, int(request.form.get('total_capacity', 100)))
            occupied = max(0, min(total_capacity, int(request.form.get('occupied', 42))))
        except ValueError:
            total_capacity = 100
            occupied = 42

    available = max(0, total_capacity - occupied)
    occupancy_pct = round((occupied / total_capacity) * 100, 1)

    return render_template(
        'monitor.html',
        total=total_capacity,
        occupied=occupied,
        available=available,
        occupancy_pct=occupancy_pct,
        active_page='monitor'
    )

@app.route('/about')
def about():
    """Route 7: Project documentation & academic details."""
    return render_template('about.html', active_page='about')

if __name__ == '__main__':
    # Local Windows/Linux dev execution
    app.run(host='0.0.0.0', port=5000, debug=True)
