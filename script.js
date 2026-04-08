const cells = Array.from(document.querySelectorAll(".cell"));
const numInputs = document.querySelectorAll(".num-input");
const eraser = document.querySelector(".eraser");
const difficultyText = document.getElementById("difficulty-text");
const difficulties = document.querySelectorAll(".difficulty");
const startBtn = document.getElementById("start-btn");
const clickEvent = new Event("click");
let selectedCell;
let puzzle;
let solvedPuzzle;
startBtn.addEventListener("click", () => {
    const finalDiff = difficultyText.textContent;
    document.getElementById("web-header").style.display = "none";
    document.getElementById("grid").style.display = "grid";
    document.getElementById("game-controls").style.display = "flex";
    document.getElementById("input-section").style.display = "flex";
    ({ puzzle, solution } = generateSudoku(finalDiff));
    loadNumbers(puzzle);
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
                    alert("Your billa didn't implement anything for win yet, mwahh🐐💋")
                }
            } else {
                selectedCell.classList.add("incorrect");
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
function loadNumbers(puzzle) {
    puzzle.forEach((row, i) => {
        row.forEach((num, j) => {
            if (num !== 0) {
                cells[i * 9 + j].textContent = num;
                cells[i * 9 + j].classList.add("fixed-cell");
            }
        });
    });
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
