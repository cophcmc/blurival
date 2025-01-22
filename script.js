const maxStats = {
    maxGamesPlayed: 500,
    maxNormalizedAverage: 1.0
};

// Function to normalize metrics
function calculateNormalizedMetric(metricTotal, gamesPlayed) {
    return metricTotal / gamesPlayed;
}

// Longevity Factor Calculation
function calculateLongevityFactor(normalizedAverage, maxNormalizedAverage, gamesPlayed, maxGamesPlayed) {
    return 1 + (normalizedAverage / maxNormalizedAverage) * Math.log(gamesPlayed) / Math.log(maxGamesPlayed);
}

// Final Player Score Calculation
function calculatePlayerScore(metrics, weights, clf) {
    let score = 0;
    for (let i = 0; i < metrics.length; i++) {
        score += metrics[i] * weights[i];
    }
    return score * clf;
}

// Grade Conversion
function getGrade(score) {
    if (score >= 98) return "S (You are not from this world.)";
    if (score >= 90) return "A (Outstanding & Dominance!)";
    if (score >= 80) return "B (Strong, Skilled.)";
    if (score >= 70) return "C (Average, Decent.)";
    if (score >= 60) return "D (Poor, Replacable, Weak.)";
    return "F (Very Limited...)";
}

// Form Submit Handler
document.getElementById("gradingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const gamesPlayed = parseInt(document.getElementById("gamesPlayed").value);
    const goals = parseInt(document.getElementById("goals").value);
    const assists = parseInt(document.getElementById("assists").value);
    const steals = parseInt(document.getElementById("steals").value);
    const dribbles = parseInt(document.getElementById("dribbles").value);
    const saves = parseInt(document.getElementById("saves").value || 0);
    const offense = parseInt(document.getElementById("offense").value);

    // Define role-specific weights
    let weights;
    switch (role) {
        case "striker":
            weights = [0.3, 0.2, 0.15, 0.15, 0, 0.2];
            break;
        case "defender":
            weights = [0.1, 0.1, 0.4, 0.1, 0, 0.3];
            break;
        case "goalkeeper":
            weights = [0, 0, 0.1, 0, 0.6, 0.3];
            break;
        default:
            document.getElementById("result").innerHTML = `<div class="alert alert-danger">Invalid role selected.</div>`;
            return;
    }

    // Normalize metrics
    const normalizedMetrics = [
        calculateNormalizedMetric(goals, gamesPlayed),
        calculateNormalizedMetric(assists, gamesPlayed),
        calculateNormalizedMetric(steals, gamesPlayed),
        calculateNormalizedMetric(dribbles, gamesPlayed),
        calculateNormalizedMetric(saves, gamesPlayed),
        calculateNormalizedMetric(offense, gamesPlayed)
    ];

    // Calculate normalized average and longevity factor
    const normalizedAverage = normalizedMetrics.reduce((a, b) => a + b, 0) / normalizedMetrics.length;
    const clf = calculateLongevityFactor(normalizedAverage, maxStats.maxNormalizedAverage, gamesPlayed, maxStats.maxGamesPlayed);

    // Calculate final score and grade
    const score = calculatePlayerScore(normalizedMetrics, weights, clf);
    const grade = getGrade(score);

    // Display result
    document.getElementById("result").innerHTML = `
        <div class="alert alert-success">
            <strong>Score:</strong> ${score.toFixed(2)} <br>
            <strong>Grade:</strong> ${grade}
        </div>
    `;
});