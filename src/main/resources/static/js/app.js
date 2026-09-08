/**
 * Daily Mood & Stress Tracker — Interactive JavaScript
 * Chart.js integration, mood picker, and stress slider
 */

// === MOOD PICKER ===
document.addEventListener('DOMContentLoaded', () => {
    initMoodPicker();
    initNotesAnalysis();
    initCharts();
    autoHideAlerts();
});

function initMoodPicker() {
    const moodOptions = document.querySelectorAll('.mood-option');
    if (!moodOptions.length) return;

    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            moodOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}

function initNotesAnalysis() {
    const notesTextarea = document.getElementById('mood-notes');
    const analysisPreview = document.getElementById('analysis-preview');
    if (!notesTextarea || !analysisPreview) return;

    let debounceTimer;
    notesTextarea.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const text = notesTextarea.value.trim();
            if (text.length > 10) {
                analysisPreview.style.display = 'block';
                analysisPreview.innerHTML = '<span class="ai-label">🤖 AI Stress Preview</span><span class="ai-text">Your input will be analyzed for stress & sentiment indicators upon submission.</span>';
            } else {
                analysisPreview.style.display = 'none';
            }
        }, 500);
    });
}

// === CHART.JS INITIALIZATION ===
function initCharts() {
    initMoodChart();
    initStressChart();
}

function initMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    const dates = JSON.parse(ctx.dataset.dates || '[]');
    const moods = JSON.parse(ctx.dataset.moods || '[]');
    const stressLevels = JSON.parse(ctx.dataset.stress || '[]');

    const moodLabels = ['', '😢 Awful', '😟 Low', '😐 Okay', '🙂 Good', '😄 Great'];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Mood',
                    data: moods,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'yMood'
                },
                {
                    label: 'Stress Level',
                    data: stressLevels,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.06)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f43f5e',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'yStress'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#334155',
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Mood') {
                                return 'Mood: ' + (moodLabels[context.raw] || context.raw);
                            }
                            return 'Stress: ' + context.raw + '/10';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' }
                    }
                },
                yMood: {
                    type: 'linear',
                    position: 'left',
                    min: 1,
                    max: 5,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#2563eb',
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                        stepSize: 1,
                        callback: function(value) {
                            return moodLabels[value] || value;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Mood Level',
                        color: '#2563eb',
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' }
                    }
                },
                yStress: {
                    type: 'linear',
                    position: 'right',
                    min: 1,
                    max: 10,
                    grid: { display: false },
                    ticks: {
                        color: '#f43f5e',
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Stress Level',
                        color: '#f43f5e',
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' }
                    }
                }
            }
        }
    });
}

function initStressChart() {
    const ctx = document.getElementById('stressOnlyChart');
    if (!ctx) return;

    const dates = JSON.parse(ctx.dataset.dates || '[]');
    const stressLevels = JSON.parse(ctx.dataset.stress || '[]');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Stress Level',
                data: stressLevels,
                backgroundColor: stressLevels.map(s => {
                    if (s >= 7) return 'rgba(244, 63, 94, 0.85)';
                    if (s >= 4) return 'rgba(245, 158, 11, 0.85)';
                    return 'rgba(16, 185, 129, 0.85)';
                }),
                borderColor: stressLevels.map(s => {
                    if (s >= 7) return '#f43f5e';
                    if (s >= 4) return '#f59e0b';
                    return '#10b981';
                }),
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    cornerRadius: 8,
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } }
                },
                y: {
                    min: 0,
                    max: 10,
                    grid: { color: '#f1f5f9' },
                    ticks: { color: '#64748b', stepSize: 2 }
                }
            }
        }
    });
}

function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
}

function validateMoodForm() {
    const moodSelected = document.querySelector('input[name="mood"]:checked');
    if (!moodSelected) {
        alert('Please select how you are feeling today!');
        return false;
    }
    return true;
}
