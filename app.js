// [abbreviation, name], alphabetical by name
const STATES = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
    ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["FL", "Florida"], ["GA", "Georgia"],
    ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
    ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"],
    ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"],
    ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
    ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"],
    ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

// short message when the count reaches one of these
const MILESTONES = { 10: "10 down!", 25: "Halfway there!", 40: "10 to go!", 50: "All 50 found!" };

// saved as { "Alabama": 0 | 1, ... } under this key since the first version, so existing trips carry over
const STORAGE_KEY = "stateTracking";

const plateGrid = document.getElementById("plates");
const foundCount = document.getElementById("found-count");
const progressText = document.getElementById("progress-text");
const progressInner = document.getElementById("progress-inner");
const resetScreen = document.getElementById("resetScreen");
const helpScreen = document.getElementById("helpScreen");
const resetText = document.getElementById("reset-text");
const toast = document.getElementById("toast");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeBtn = document.getElementById("theme-btn");
const themeColor = document.querySelector('meta[name="theme-color"]');
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");

const SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

let found = loadFound();

function loadFound() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        return new Set(STATES.filter(([, name]) => saved[name] === 1).map(([, name]) => name));
    } catch {
        return new Set();
    }
}

function saveFound() {
    const saved = Object.fromEntries(STATES.map(([, name]) => [name, found.has(name) ? 1 : 0]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function buildPlates() {
    for (const [abbr, name] of STATES) {
        const plate = document.createElement("button");
        plate.className = "plate";
        plate.dataset.state = name;
        // the one name too long for a phone tile: soft hyphen so it breaks as "Massa-chusetts"
        const label = name === "Massachusetts" ? "Massa&shy;chusetts" : name;
        plate.innerHTML = `<span class="plate-abbr">${abbr}</span><span class="plate-name">${label}</span>`;
        plateGrid.appendChild(plate);
    }
}

// sync every plate and the progress bar with `found`
function render() {
    for (const plate of plateGrid.children) {
        plate.setAttribute("aria-pressed", found.has(plate.dataset.state));
    }
    foundCount.textContent = found.size;
    // the gradient spans the whole bar and gets uncovered as you go, so yellow only shows near the end
    progressInner.style.clipPath = `inset(0 ${100 - (found.size / STATES.length) * 100}% 0 0 round 3px)`;
    progressText.classList.toggle("complete", found.size === STATES.length);
}

function togglePlate(plate) {
    const name = plate.dataset.state;
    if (found.has(name)) {
        found.delete(name);
    } else {
        found.add(name);
        pop(plate);
        if (MILESTONES[found.size]) showToast(MILESTONES[found.size]);
        if (found.size === STATES.length) confetti();
    }
    saveFound();
    render();
}

// restart the bounce even if the plate is tapped again mid-animation
function pop(plate) {
    plate.classList.remove("pop");
    void plate.offsetWidth;
    plate.classList.add("pop");
}

// the button's choice (saved by the head script's key) wins; otherwise follow the phone's setting
function currentTheme() {
    return document.documentElement.dataset.theme || (prefersLight.matches ? "light" : "dark");
}

// the button shows the theme you'd switch to
function applyTheme() {
    const light = currentTheme() === "light";
    themeBtn.innerHTML = light ? MOON : SUN;
    themeBtn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    themeColor.content = light ? "#F4F5F7" : "#1C1D24";
}

function toggleTheme() {
    const next = currentTheme() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
        localStorage.setItem("Theme", next);
    } catch {}
    applyTheme();
}

let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// a few seconds of falling paper in the palette colors, drawn on a throwaway canvas
function confetti() {
    if (reduceMotion.matches) return;
    const canvas = document.createElement("canvas");
    canvas.className = "confetti";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio || 1;
    canvas.width = innerWidth * scale;
    canvas.height = innerHeight * scale;
    ctx.scale(scale, scale);

    const colors = ["#3DDC97", "#FFC247", "#E8EDF2", "#FF6B6B", "#5AB8FF"];
    const pieces = Array.from({ length: 160 }, () => ({
        x: Math.random() * innerWidth,
        y: -20 - Math.random() * innerHeight * 0.5,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        size: 6 + Math.random() * 6,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const start = performance.now();
    function frame(now) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (const p of pieces) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.angle += p.spin;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        }
        if (now - start < 4000) requestAnimationFrame(frame);
        else canvas.remove();
    }
    requestAnimationFrame(frame);
}

function openReset() {
    // nothing to lose, so skip the confirmation
    if (found.size === 0) return;
    resetText.textContent = `This clears all ${found.size} plate${found.size === 1 ? "" : "s"} you've found.`;
    resetScreen.hidden = false;
    document.getElementById("reset-cancel").focus();
}

function closeReset() {
    resetScreen.hidden = true;
    document.getElementById("reset-btn").focus();
}

function resetTrip() {
    found.clear();
    saveFound();
    render();
    closeReset();
}

function openHelp() {
    helpScreen.hidden = false;
    document.getElementById("help-close").focus();
}

function closeHelp() {
    helpScreen.hidden = true;
    document.getElementById("help-btn").focus();
}

plateGrid.addEventListener("click", (event) => {
    const plate = event.target.closest(".plate");
    if (plate) togglePlate(plate);
});

themeBtn.addEventListener("click", toggleTheme);
prefersLight.addEventListener("change", applyTheme);
document.getElementById("reset-btn").addEventListener("click", openReset);
document.getElementById("reset-confirm").addEventListener("click", resetTrip);
document.getElementById("reset-cancel").addEventListener("click", closeReset);
document.getElementById("help-btn").addEventListener("click", openHelp);
document.getElementById("help-close").addEventListener("click", closeHelp);

// tap outside the panel or press Escape to cancel
resetScreen.addEventListener("click", (event) => {
    if (event.target === resetScreen) closeReset();
});
helpScreen.addEventListener("click", (event) => {
    if (event.target === helpScreen) closeHelp();
});
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!resetScreen.hidden) closeReset();
    if (!helpScreen.hidden) closeHelp();
});

document.getElementById("total-count").textContent = STATES.length;
buildPlates();
render();
applyTheme();

// first visit: show How to Play once. Not Math Dash's "Help_Seen": the HSLD games can share one origin's storage
try {
    if (!localStorage.getItem("Plates_Help_Seen")) {
        openHelp();
        localStorage.setItem("Plates_Help_Seen", "1");
    }
} catch {}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
