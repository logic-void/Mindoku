const cells = Array.from(document.querySelectorAll(".cell"));
const numInputs = document.querySelectorAll(".num-input");
const eraser = document.querySelector(".eraser");
const difficultyText = document.getElementById("difficulty-text");
const difficulties = document.querySelectorAll(".difficulty");
const startBtn = document.getElementById("start-btn");
const controlsHeader = document.getElementById("controls-header");
const mistakeText = document.getElementById("mistake-text");
let mistakeLimit = JSON.parse(localStorage.getItem("mistakeLimit") || "true");
let hints = JSON.parse(localStorage.getItem("hints") || "true");
const settingsBtn = document.querySelector(".settings-btn");
const settingsContainer = document.querySelector(".settings-container");
const settings = document.querySelectorAll(".settings-menu li");
const closeSettings = document.querySelector(".close-settings");
const hintBtn = document.querySelector(".hint-btn");
const timer = document.getElementById("timer");
const gameOver = document.getElementById("game-over");
const endText = document.getElementById("end-text");
const endTime = document.getElementById("end-time");
const endDifficulty = document.getElementById("end-difficulty");
const endDifficultyText = document.getElementById("end-difficulty-text");
const endDifficultyContainer = document.querySelector(
    ".end-difficulty-container"
);
const endDifficulties = Array.from(
    document.querySelectorAll(".end-difficulty-option")
);
const playAgain = document.getElementById("play-again");
const endMistake = document.getElementById("end-mistakes");
const clickEvent = new Event("click");
let selectedCell;
let startTime;
let accumulatedTime = 0;
let pauseStart;
let timerId;
let puzzle;
let solvedPuzzle;
hints ? null : (hintBtn.style.display = "none");
function handleSettingsClick(clickedSetting) {
    clickedSetting.classList.toggle("active");
    switch (clickedSetting.dataset.toggle) {
        case "mistakes":
            mistakeLimit = !mistakeLimit;
            localStorage.setItem("mistakeLimit", JSON.stringify(mistakeLimit));
            break;
        case "hints":
            hints = !hints;
            hints
                ? (hintBtn.style.display = "block")
                : (hintBtn.style.display = "none");
            localStorage.setItem("hints", JSON.stringify(hints));
            break;
        default:
            null;
    }
}
settings.forEach(setting => {
    setting.addEventListener("click", e => {
        e.stopPropagation();
        handleSettingsClick(e.target);
    });
    setting.querySelector("span").addEventListener("click", e => {
        e.stopPropagation();
        handleSettingsClick(e.target.parentElement);
    });
    if (setting.dataset.toggle == "mistakes") {
        mistakeLimit
            ? setting.classList.add("active")
            : setting.classList.remove("active");
    } else if (setting.dataset.toggle == "hints") {
        if (hints) {
            setting.classList.add("active");
            hintBtn.style.display = "block";
        } else {
            setting.classList.remove("active");
            hintBtn.style.display = "none";
        }
    }
});
startBtn.addEventListener("click", () => {
    const finalDiff = difficultyText.textContent;
    endDifficulty.textContent = finalDiff;
    endDifficultyText.textContent = finalDiff;
    document.getElementById("web-header").style.display = "none";
    document.getElementById("grid").style.display = "grid";
    document.getElementById("game-controls").style.display = "flex";
    document.getElementById("input-section").style.display = "flex";
    controlsHeader.style.display = "flex";
    timer.style.display = "block";
    startTimer();
    ({ puzzle, solution } = generateSudoku(finalDiff));
    setTimeout(() => {
        loadNumbers(puzzle);
    }, 500);
});
function startTimer() {
    startTime = performance.now();
    timerId = requestAnimationFrame(tick);
}
function tick() {
    timer.textContent =
        "Timer - " +
        formatTime(performance.now() - (startTime + accumulatedTime));
    timerId = requestAnimationFrame(tick);
}
function toggleSettingsMenu() {
    const ref = settingsContainer.classList.toggle("active");
    if (ref) {
        pauseStart = performance.now();
        cancelAnimationFrame(timerId);
    } else {
        accumulatedTime += performance.now() - pauseStart;
        timerId = requestAnimationFrame(tick);
    }
}
settingsBtn.addEventListener("click", toggleSettingsMenu);
closeSettings.addEventListener("click", toggleSettingsMenu);
hintBtn.addEventListener("click", () => {
    let cellAnswer;
    if (selectedCell && !selectedCell.classList.contains("fixed-cell")) {
        const cellIndex = cells.indexOf(selectedCell);
        cellAnswer = solution[Math.floor(cellIndex / 9)][cellIndex % 9];
        selectedCell.textContent = cellAnswer;
        selectedCell.classList.remove("incorrect");
        selectedCell.classList.add("correct");
        selectedCell.classList.add("fixed-cell");
    }
    let numCount = 0;
    cells.forEach(eachCell => {
        if (
            eachCell.textContent == cellAnswer &&
            eachCell.classList.contains("fixed-cell")
        ) {
            numCount++;
        }
    });
    if (numCount == 9) {
        const removingInput = numInputs[cellAnswer - 1];
        removingInput.classList.add("disabled");
        removingInput.addEventListener("transitionend", e => {
            e.target.style.display = "none";
        });
    }
});
eraser.addEventListener("click", () => {
    if (selectedCell && !selectedCell.classList.contains("fixed-cell")) {
        selectedCell.textContent = "";
    }
});
difficulties.forEach(diff => {
    diff.addEventListener("click", e => {
        const clickedDiff = e.target;
        document
            .querySelector(".difficulty-container")
            .classList.remove("active");
        difficultyText.textContent = clickedDiff.textContent;
    });
});
difficultyText.addEventListener("click", () => {
    document.querySelector(".difficulty-container").classList.toggle("active");
});
numInputs.forEach(numInput => {
    numInput.addEventListener("click", e => {
        const clickedInput = e.target;
        if (selectedCell) {
            selectedCell.textContent = numInput.textContent;
            const cellIndex = cells.indexOf(selectedCell);
            const correctNum =
                solution[Math.floor(cellIndex / 9)][cellIndex % 9];
            if (selectedCell.textContent == correctNum) {
                selectedCell.classList.remove("incorrect");
                selectedCell.classList.add("correct");
                selectedCell.classList.add("fixed-cell");
                selectedCell.dispatchEvent(clickEvent);
                let numCount = 0;
                cells.forEach(eachCell => {
                    if (
                        eachCell.textContent == correctNum &&
                        eachCell.classList.contains("fixed-cell")
                    ) {
                        numCount++;
                    }
                });
                if (numCount == 9) {
                    const removingInput = numInputs[correctNum - 1];
                    removingInput.classList.add("disabled");
                    removingInput.addEventListener("transitionend", e => {
                        e.target.style.display = "none";
                    });
                }
                if (
                    cells.every(cell => cell.classList.contains("fixed-cell"))
                ) {
                    cancelAnimationFrame(timerId);
                    document.getElementById("grid").style.display = "none";
                    timer.style.display = "none";
                    document.getElementById("controls-header").style.display =
                        "none";
                    document.getElementById("game-controls").style.display =
                        "none";
                    document.getElementById("input-section").style.display =
                        "none";
                    gameOver.style.display = "flex";
                    showGameOver("Well done, you know your stuff!");
                }
            } else {
                selectedCell.classList.add("incorrect");
                if (mistakeText.textContent++ + 1 == 3 && mistakeLimit) {
                    window.cancelAnimationFrame(timerId);
                    document.getElementById("grid").style.display = "none";
                    timer.style.display = "none";
                    document.getElementById("controls-header").style.display =
                        "none";
                    document.getElementById("game-controls").style.display =
                        "none";
                    document.getElementById("input-section").style.display =
                        "none";
                    gameOver.style.display = "flex";
                    showGameOver("Better luck next time!");
                }
                selectedCell.dispatchEvent(clickEvent);
            }
        }
    });
});
cells.forEach(cell => {
    cell.addEventListener("click", e => {
        const clickedCell = e.target;
        selectedCell = clickedCell.classList.contains("fixed-cell")
            ? null
            : clickedCell;
        cells.forEach(tempCell => {
            tempCell.classList.remove("highlight");
        });
        if (clickedCell.textContent) {
            cells.forEach(temp => {
                if (temp.textContent === clickedCell.textContent) {
                    temp.classList.add("highlight");
                } else {
                    temp.classList.remove("highlight");
                }
            });
        }
    });
});
function loadNumbers(puzzle, numIndex = 0) {
    const num = puzzle[Math.floor(numIndex / 9)][numIndex % 9];
    const currenrCell = cells[numIndex];
    if (num !== 0) {
        currenrCell.textContent = num;
        currenrCell.classList.add("fixed-cell");
    }
    numIndex + 1 < 81
        ? setTimeout(() => {
              loadNumbers(puzzle, numIndex + 1);
          }, 15)
        : null;
}
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = num => String(num).padStart(2, "0");
    return `${pad(hrs)} : ${pad(mins)} : ${pad(secs)}`;
}
function generateSudoku(difficulty = "medium") {
    function createGrid() {
        return Array.from({ length: 9 }, () => Array(9).fill(0));
    }
    function isValid(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + (i % 3);
            if (grid[boxRow][boxCol] === num) return false;
        }
        return true;
    }
    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of nums) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function makePuzzle(grid, blanksCount) {
        let puzzle = grid.map(row => row.slice());
        let cells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) cells.push([r, c]);
        }
        shuffle(cells);
        for (let i = 0; i < blanksCount && i < cells.length; i++) {
            const [row, col] = cells[i];
            puzzle[row][col] = 0;
        }
        return puzzle;
    }
    const solution = createGrid();
    solve(solution);
    let blanks;
    switch (difficulty.toLowerCase()) {
        case "easy":
            blanks = 41;
            break;
        case "medium":
            blanks = 48;
            break;
        case "hard":
            blanks = 54;
            break;
        default:
            blanks = 48;
    }
    const puzzle = makePuzzle(solution, blanks);
    return { puzzle, solution };
}
endDifficultyText.addEventListener("click", () => {
    endDifficultyContainer.classList.toggle("active");
});
function showGameOver(endingText) {
    endText.textContent = endingText;
    endTime.textContent = timer.textContent.slice(8);
    endMistake.textContent = mistakeText.textContent;
}
endDifficulties.forEach(endDifficulty => {
    endDifficulty.addEventListener("click", e => {
        const clickedEndDifficulty = e.target;
        endDifficultyContainer.classList.remove("active");
        endDifficultyText.textContent = clickedEndDifficulty.textContent;
    });
});
playAgain.addEventListener("click", () => {
    const finalDiff = endDifficultyText.textContent;
    endDifficulty.textContent = finalDiff;
    gameOver.style.display = "none";
    document.getElementById("grid").style.display = "grid";
    document.getElementById("game-controls").style.display = "flex";
    document.getElementById("input-section").style.display = "flex";
    controlsHeader.style.display = "flex";
    timer.style.display = "block";
    mistakeText.textContent = 0;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("fixed-cell");
        cell.classList.remove("incorrect");
        cell.classList.remove("correct");
        cell.classList.remove("highlight");
        cell.style.anchorName = "";
    });
    numInputs.forEach(numInput => {
        numInput.classList.remove("disabled");
    });
    selectedCell = null;
    accumulatedTime = 0;
    startTimer();
    ({ puzzle, solution } = generateSudoku(finalDiff));
    setTimeout(() => {
        loadNumbers(puzzle);
    }, 500);
});
emailjs.init("vqs5HCWrdUB8Amz6P");
