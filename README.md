# Smart College Parking Space Finder

A complete, production-grade Data Science & Machine Learning web application designed for a college mini project.

## Project Structure
- **Live Interactive Dashboard (React + TypeScript):** Running live in the AI Studio environment on port 3000.
- **Python Flask College Deliverable (`python_college_project/`):** Full standalone Python project with `app.py`, `ml_pipeline.py`, Jinja2 templates, static CSS/JS, `requirements.txt`, dataset, and 1-click `run_windows.bat` runner script.
- **Dataset (`Parking Data.csv`):** 1,312 historical facility records across 274 cities and 10 states.

## Key Modules
1. **Dashboard:** Actual aggregated dataset statistics (1,312 records, 39.54 avg spaces, 1,688 max capacity, min 0, 274 cities, 3 property types) and distribution comparisons.
2. **Dataset Analysis:** Data cleaning inspection, schema audit, missing values audit (0 nulls), multi-attribute filtering, and CSV download.
3. **Model Performance:** Random Forest Regressor evaluation using MAE, RMSE, MSE, and R² scores, actual vs predicted comparison table, error intervals (±10, ±25, ±50), and plain-language metric explanations.
4. **Factor Analysis:** Empirical association analysis between Total Parking Spaces and Property Type, Building Status, Ownership (Owned vs Leased), and State.
5. **Predict Parking Capacity:** Live inference form evaluating facility parameters to estimate total structural parking capacity.
6. **Parking Monitor (Demo):** Hardware telemetry simulation calculating `Available = Total Capacity - Occupied Spaces` with clear labeling: *"Simulation — Not Connected to Live Sensors"*.
7. **About Project:** Problem statement, aim, ML pipeline, technical stack, current limitations, and future hardware sensor integration (ultrasonic/cameras/gates).
