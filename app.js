const stateTracking = localStorage.getItem("stateTracking") ? JSON.parse(localStorage.getItem("stateTracking")) : {
    "Alabama": 0, "Alaska": 0, "Arizona": 0, "Arkansas": 0, "California": 0, "Colorado": 0,
    "Connecticut": 0, "Delaware": 0, "Florida": 0, "Georgia": 0, "Hawaii": 0, "Idaho": 0,
    "Illinois": 0, "Indiana": 0, "Iowa": 0, "Kansas": 0, "Kentucky": 0, "Louisiana": 0,
    "Maine": 0, "Maryland": 0, "Massachusetts": 0, "Michigan": 0, "Minnesota": 0,
    "Mississippi": 0, "Missouri": 0, "Montana": 0, "Nebraska": 0, "Nevada": 0, "New Hampshire": 0,
    "New Jersey": 0, "New Mexico": 0, "New York": 0, "North Carolina": 0, "North Dakota": 0,
    "Ohio": 0, "Oklahoma": 0, "Oregon": 0, "Pennsylvania": 0, "Rhode Island": 0,
    "South Carolina": 0, "South Dakota": 0, "Tennessee": 0, "Texas": 0, "Utah": 0,
    "Vermont": 0, "Virginia": 0, "Washington": 0, "West Virginia": 0, "Wisconsin": 0, "Wyoming": 0
  };
const licensePlates = document.querySelectorAll(".license-plate");
const plateCounter = document.querySelector(".counter");
const resetButton = document.querySelector(".reset-button")

console.log(stateTracking)
onLoad()

function onLoad() {
    Object.keys(stateTracking).forEach(state => {
        if (stateTracking[state] == 1) {
            let checkedPlate = document.querySelector(`.license-plate img[data-state="${state}"]`).closest('.license-plate');
            checkedPlate.classList.add("clicked");
        };
    });
    updateCounter();
}

function saveState() {
    localStorage.setItem("stateTracking", JSON.stringify(stateTracking));
}

// Update visual counter for remaining plates
function updateCounter() {
    let totalPlates = document.querySelectorAll(".license-plate").length;
    let foundPlates = document.querySelectorAll(".license-plate.clicked").length;
    let remainingPlates = totalPlates - foundPlates;
    plateCounter.textContent = `${remainingPlates}`;
}

// Reset Game; remove .clicked proeprty, reset saved data, and reset .counter
function resetGame(){
    licensePlates.forEach(plate => {
        plate.classList.remove('clicked');
    });
    Object.keys(stateTracking).forEach(state => {
        stateTracking[state] = 0;
    });
    plateCounter.textContent = document.querySelectorAll(".license-plate").length;
    saveState();
}

// Update attribute to show state on hover
document.querySelectorAll('.license-plate').forEach(plate => {
    const img = plate.querySelector('img');
    plate.setAttribute('data-state', img.getAttribute('data-state'));
});

// Event Handling License Plates being clicked; toggle .clicked property and update saved data
licensePlates.forEach(plate => plate.addEventListener("click", () => {
    if (plate.classList.contains("clicked")) {
        plate.classList.remove('clicked');
        stateTracking[plate.dataset.state] = 0;
    } else {
        plate.classList.add('clicked');
        stateTracking[plate.dataset.state] = 1;
    }
    saveState();
    updateCounter();
}));

// Event Listener reset game
resetButton.addEventListener("click", resetGame);

// Trying to fix touch ho
document.addEventListener('DOMContentLoaded', function() {
    if ('ontouchstart' in document.documentElement) {
        licensePlates.forEach(function(element) {
            element.addEventListener('touchstart', function() {
                element.classList.add('no-hover');
            });
        });
    }
});