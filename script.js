document.getElementById("gradingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const maxStats = {
        maxNormalizedAverage: 10000,
        maxGamesPlayed: 10000  // Set to 10000, or another value based on your needs
    };

     // Maximum games played
    // Get the selected role
    const role = document.getElementById("role").value;

// Get all stats inputs
const gamesPlayed = parseInt(document.getElementById("gamesPlayed").value);
const goals = parseInt(document.getElementById("goals").value);
const assists = parseInt(document.getElementById("assists").value);
const steals = parseInt(document.getElementById("steals").value);
const dribbles = parseInt(document.getElementById("dribbles").value);
const passes = parseInt(document.getElementById("passes").value);

// Handle saves input based on the selected role (only for goalkeeper)
let saves = 0;
if (role === 'goalkeeper' || role === 'all') {
    saves = parseInt(document.getElementById("saves").value);  // Only parse saves if role is goalkeeper or all
}

// Calculate offense dynamically based on dribbles, passes, and assists (excluding for goalkeeper)
const offense = (role) ? (dribbles * 0.25 + passes * 0.5 + assists * 0.4) : 3;

// Define role-specific weights (excluding non-relevant metrics for goalkeeper)
let weights;
switch (role) {
    case "striker":
        weights = [0.3, 0.025, 0.1, 0.1, 0, 0.25];  // Reduced assist weight
        break;
    case "defender":
        weights = [0.3, 0.025, 0.1, 0.45, 0, 0.25];  // Reduced assist weight and adjusted others
        break;
    case "goalkeeper":
        weights = [0.15, 0.015, 0.1, 0.1, 0.3, 0.4];  // Include all except goals
        break;
    case "all":
        weights = [0.15, 0.1, 0.05, 0.05, 0.15, 0.15];  // Consider all metrics for total career role
        break;
    default:
        document.getElementById("result").innerHTML = `<div class="alert alert-danger">Invalid role selected.</div>`;
        return;
}

// Function to calculate normalized metric with safe handling for division by zero
function calculateNormalizedMetric(stat, gamesPlayed) {
    return gamesPlayed > 0 ? stat / gamesPlayed : 0;
}

// Normalize metrics
const normalizedMetrics = [
    (role !== 'goalkeeper') ? calculateNormalizedMetric(goals, gamesPlayed) : 0,  // Exclude goals for goalkeeper
    (role === 'goalkeeper' || role === 'all') ? calculateNormalizedMetric(saves, gamesPlayed) : 0, // Include saves for goalkeeper and all
    calculateNormalizedMetric(offense, gamesPlayed) // Always calculate offense for all roles
];

// Longevity Factor (assumes maxStats is defined somewhere globally)
const clf = calculateLongevityFactor(
    Math.max(...normalizedMetrics), 
    maxStats.maxNormalizedAverage, 
    gamesPlayed, 
    maxStats.maxGamesPlayed
);


// Calculate Final Score (assuming calculatePlayerScore is defined)
const finalScore = calculatePlayerScore(normalizedMetrics, weights, clf);

// Individual Grades (goals show "N/A" for goalkeeper and everything for "all" role)
const grades = {
    goals: (role !== 'goalkeeper') ? getIndividualGrade(calculateNormalizedMetric(goals, gamesPlayed)) : "N/A",  // Exclude goals for goalkeeper
    assists: (role) ? getIndividualGrade(calculateNormalizedMetric(assists, gamesPlayed)) : "N/A",
    steals: (role) ? getIndividualGrade(calculateNormalizedMetric(steals, gamesPlayed)) : "N/A",
    dribbles: (role) ? getIndividualGrade(calculateNormalizedMetric(dribbles, gamesPlayed)) : "N/A",
    passes: (role) ? getIndividualGrade(calculateNormalizedMetric(passes, gamesPlayed)) : "N/A",
    offense: (role) ? getIndividualGrade(calculateNormalizedMetric(offense, gamesPlayed)) : "N/A",
    saves: (role === 'goalkeeper' || role === 'all') ? getIndividualGrade(calculateNormalizedMetric(saves, gamesPlayed)) : "N/A"
};

    // Get Overall Grade Based on Individual Grades
    const overallGrade = getGradeFromIndividualGrades(grades);

    // Display Results
    document.getElementById("result").innerHTML = `
        <div class="alert alert-success">
            <strong>Overall Grade:</strong> ${overallGrade}<br>
            <strong>Individual Grades:</strong><br>
            - Goals: ${grades.goals}<br>
            - Assists: ${grades.assists}<br>
            - Steals: ${grades.steals}<br>
            - Dribbles: ${grades.dribbles}<br>
            - Passes: ${grades.passes}<br>
            - Offense: ${grades.offense}<br>
            - Saves: ${grades.saves}
        </div>
    `;
});

// Adjusted Individual Grade Function Based on New Grade Scale
function getIndividualGrade(normalizedValue) {
    // Realistic grading system based on normalized values and expectations for soccer players
    if (normalizedValue >= 2) return "S (Excellent, Top-tier )";
    if (normalizedValue >= 1.8) return "A (Strong, Consistent)";
    if (normalizedValue >= 1.5) return "B (Good, Reliable )";
    if (normalizedValue >= 1.2) return "C (Average, Needs Improvement)";
    if (normalizedValue >= 1.0) return "D (Below Average, Struggling)";
    if (normalizedValue >= 0.75) return "F (Poor, Very Limited)";
}

// Function to calculate normalized metric with safe handling for division by zero
function calculateNormalizedMetric(stat, gamesPlayed) {
    return gamesPlayed > 0 ? stat / gamesPlayed : 0;
}

// Longevity Factor, considers how a player has sustained performance over time
function calculateLongevityFactor(maxMetric, maxNormalizedAverage, gamesPlayed, maxGamesPlayed) {
    return Math.min(gamesPlayed / maxGamesPlayed, maxMetric / maxNormalizedAverage);
}

// Final player score based on normalized metrics, weights, and longevity factor
function calculatePlayerScore(normalizedMetrics, weights, clf) {
    let score = 0;
    for (let i = 0; i < normalizedMetrics.length; i++) {
        score += normalizedMetrics[i] * weights[i];
    }
    return score * clf;
}

// Grade the overall performance based on individual grades
function getGradeFromIndividualGrades(grades) {
    const gradeScores = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 }; // Mapping letter grades to numeric values

    let totalScore = 0;
    let count = 0;

    // Calculate the total score based on individual grades
    for (const grade of Object.values(grades)) {
        const gradeLetter = grade.split(" ")[0]; // Extract the letter grade (A, B, C, etc.)
        totalScore += gradeScores[gradeLetter] || 0; // Add the corresponding score
        count++;
    }

    const averageScore = totalScore / count;

    // Determine the overall grade based on the average score
    if (averageScore >= 5) return "S (Outstanding)";
    if (averageScore >= 4.25) return "A (Strong, Skilled)";
    if (averageScore >= 3.5) return "B (Good, Consistent)";
    if (averageScore >= 2.25) return "C (Decent, Needs Development)";
    if (averageScore >= 1.75) return "D (Below Expectations, Needs Efforts)";
    if (averageScore >= 1)return "F (Poor, Very Limited)";
}


// Get the overall grade based on individual grades
const overallGrade = getGradeFromIndividualGrades(grades);
console.log(overallGrade);
