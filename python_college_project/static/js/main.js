// Smart College Parking Space Finder - Client Script
document.addEventListener('DOMContentLoaded', function () {
    // Enable Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Dynamic city filter linkage on prediction page
    var stateSelect = document.querySelector('select[name="state"]');
    var citySelect = document.querySelector('select[name="city"]');
    
    if (stateSelect && citySelect) {
        stateSelect.addEventListener('change', function () {
            // State changed
            console.log('Selected state:', stateSelect.value);
        });
    }
});
