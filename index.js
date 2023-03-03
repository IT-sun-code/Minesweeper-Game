const gameField = document.querySelector(".game__field");

const numOfCols = 16;
const numOfRows = 16;
const numOfMines = 40;
let numOfFlagged = 0;
let numOfQuestioned = 0;
let numOfRevealed = 0;
let squares = [];
let counter = 40;
let gameEnded = false;

// Create grid of squares
function createBoard() {
  for (let i = 0; i < numOfRows; i++) {
    squares[i] = [];
    for (let j = 0; j < numOfCols; j++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.row = i;
      square.dataset.col = j;
      square.addEventListener("click", handleClick);
      square.addEventListener("contextmenu", handleRightClick);
      gameField.appendChild(square);
      squares[i][j] = {
        element: square,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isQuestioned: false,
        numOfNeighbouringMines: 0,
      };
    }
  }

  // Calculate number of neighbouring mines for each square
  for (let i = 0; i < numOfRows; i++) {
    for (let j = 0; j < numOfCols; j++) {
      if (squares[i][j].isMine) {
        continue;
      }
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = i + di;
          const nj = j + dj;
          if (ni < 0 || ni >= numOfRows || nj < 0 || nj >= numOfCols) {
            continue;
          }
          if (squares[ni][nj].isMine) {
            squares[i][j].numOfNeighbouringMines++;
          }
        }
      }
    }
  }
}

// Подсчитать пустые клеточки
function revealSquare(square) {
  if (square.isRevealed || square.isFlagged) {
    return;
  }
  square.isRevealed = true;
  square.element.classList.add("field__empty");
  numOfRevealed++;
  if (square.numNeighbouringMines === 0) {
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const ni = parseInt(square.element.dataset.row) + di;
        const nj = parseInt(square.element.dataset.col) + dj;
        if (ni < 0 || ni >= numOfRows || nj < 0 || nj >= numOfCols) {
          continue;
        }
        revealSquare(squares[ni][nj]);
      }
    }
  }
}

// По левому клику
function handleClick(event) {
  if (gameEnded) {
    return;
  }

  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  const square = squares[row][col];

  if (square.isFlagged || square.isQuestioned) {
    return;
  }

  if (square.isMine) {
    gameEnded = true;
    emoticon.src = "images/emoticonsButtons/btnLose.png";
    square.element.classList.add("bomb__expoled");

    for (let i = 0; i < numOfRows; i++) {
      for (let j = 0; j < numOfCols; j++) {
        squares[i][j].element.style.pointerEvents = "none";
        if (squares[i][j].isMine && !squares[i][j].isFlagged) {
          squares[i][j].element.classList.remove("bomb_hidden");
          squares[i][j].element.classList.remove("questioned");
          squares[i][j].element.classList.add("bomb");
        } else if (!squares[i][j].isMine && squares[i][j].isFlagged) {
          squares[i][j].element.classList.remove("bomb_hidden");
          squares[i][j].element.classList.add("not_bomb");
        }
      }
    }
    return;
  }

  revealSquare(square);

  if (numOfRevealed == 1) {
    startTimer();
  }

  if (numOfRevealed == 1) {
    const squareEmpty = document.querySelector(".field__empty");
    const emptyRow = Number(squareEmpty.dataset.row);
    const emptyCol = Number(squareEmpty.dataset.col);

    let numMinesRemaining = numOfMines;
    while (numMinesRemaining > 0) {
      const row = Math.floor(Math.random() * numOfRows);
      const col = Math.floor(Math.random() * numOfCols);
      if (row !== emptyRow || col !== emptyCol) {
        if (!squares[row][col].isMine) {
          squares[row][col].isMine = true;
          numMinesRemaining--;
          squares[row][col].element.classList.add("bomb_hidden");
        }
      }
    }
  }

  if (numOfRevealed === numOfRows * numOfCols - numOfMines) {
    for (let i = 0; i < numOfRows; i++) {
      for (let j = 0; j < numOfCols; j++) {
        squares[i][j].element.style.pointerEvents = "none";
      }
    }
    emoticon.src = "images/emoticonsButtons/btnWin.png";
  }
}

// RIGHT_CLICK___________________________________________________________________________________________
function handleRightClick(event) {
  if (numOfRevealed >= 1) {
    event.preventDefault();
    if (gameEnded) {
      return;
    }
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const square = squares[row][col];
    if (!square.isRevealed && numOfFlagged != 40) {
      if (square.isFlagged) {
        square.isFlagged = false;
        square.element.classList.remove("flagged");
        square.element.classList.add("questioned");
        square.isQuestioned = true;
        numOfQuestioned++;
        numOfFlagged--;
        setCounter();
      } else if (square.isQuestioned) {
        square.isQuestioned = false;
        square.element.classList.remove("questioned");
        numOfQuestioned--;
      } else {
        square.isFlagged = true;
        square.element.classList.remove("bomb_hidden");
        square.element.classList.add("flagged");
        numOfFlagged++;
        setCounter();
      }
    } else if (square.isFlagged && numOfFlagged == 40) {
      square.isFlagged = false;
      square.element.classList.remove("flagged");
      square.element.classList.add("questioned");
      square.isQuestioned = true;
      numOfQuestioned++;
      numOfFlagged--;
      setCounter();
    }
  }
}

// START_COUNTER___________________________________________________________________________________________
const counterDigits = document.querySelectorAll(".game__counter_img");
counterDigits.forEach((image, index) => {
  image.dataset.id = index;
});

let counterDozens = document.querySelector("[data-id='1']");
let counterUnits = document.querySelector("[data-id='2']");

let numOfUnits = 0;
let numOfDozens = 4;

function setCounter() {
  if (numOfFlagged >= 41) return;
  let count = 40 - numOfFlagged;
  numOfUnits = count % 10;
  numOfDozens = Math.floor((count / 10) % 10);
  counterUnits.src = `images/timerDigits/timerDigit_${numOfUnits}.png`;
  counterDozens.src = `images/timerDigits/timerDigit_${numOfDozens}.png`;
}

// START_TIMER___________________________________________________________________________________________
const timerDigits = document.querySelectorAll(".game__timer_img");
timerDigits.forEach((image, index) => {
  image.dataset.id = index + 3;
});

let timerHundreds = document.querySelector("[data-id='3']");
let timerDozens = document.querySelector("[data-id='4']");
let timerUnits = document.querySelector("[data-id='5']");

let units = 0;
let dozens = 0;
let hundreds = 0;

function startTimer() {
  const timer = setInterval(() => {
    if ((hundreds == 9 && dozens == 9 && units == 9) || gameEnded) {
      clearInterval(timer);
      return;
    }
    ++units;
    if (units == 10) {
      ++dozens;
      units = 0;
    }
    if (dozens == 10) {
      ++hundreds;
      dozens = 0;
    }
    timerUnits.src = `images/timerDigits/timerDigit_${units}.png`;
    timerDozens.src = `images/timerDigits/timerDigit_${dozens}.png`;
    timerHundreds.src = `images/timerDigits/timerDigit_${hundreds}.png`;
  }, 1000);
}

// GAME RESET___________________________________________________________________________________________
const emoticon = document.querySelector(".game__emoticon_img");

emoticon.addEventListener("mousedown", handlePushEmoticon);
function handlePushEmoticon(event) {
  if (event.button === 0) {
    emoticon.src = "images/emoticonsButtons/btnRestartPressed.png";
  }
}

emoticon.addEventListener("mouseup", handleResetEmoticon);
function handleResetEmoticon(event) {
  if (event.button === 0) {
    location.reload(); // временный ресет
  }
}

createBoard();
