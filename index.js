// Получение поля и создание констант____________________
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
let hasWon = "";
let timer = null;
let seconds = 999;

// Создание стека________________________________________
class Stack {
  constructor() {
    this.items = [];
  }

  // Помещение элемента в стек
  push(element) {
    this.items.push(element);
  }

  // Извлечение элемента из стека
  pop() {
    if (this.items.length === 0) return "Underflow";
    return this.items.pop();
  }

  // Получение верхнего элемента стека
  peek() {
    return this.items[this.items.length - 1];
  }

  // Проверка, пуст ли стек
  isEmpty() {
    return this.items.length === 0;
  }

  // Получение размера стека
  size() {
    return this.items.length;
  }

  // Очищение стека
  clear() {
    this.items = [];
  }
}

// Проверка ближайших клеток_____________________________
function checkNear(row, col) {
  let fillStack = new Stack();
  fillStack.push([row, col]);

  while (!fillStack.isEmpty()) {
    // 1. Получение позиции
    let pos = fillStack.peek();
    fillStack.pop();
    // 2.1 Получение строки и столбца
    let row_num = Number(pos[0]);
    let col_num = Number(pos[1]);
    // 2.2 Открытая ячейка
    openNearNumber(row_num, col_num);
    // 3. Проверка клеток рядом
    if (!squares[row_num][col_num].isDigit) {
      // Проверка правой клетки
      if (row_num + 1 < 16) {
        let sq_1 = squares[row_num + 1][col_num];
        if (!sq_1.isMine && !sq_1.isRevealed)
          fillStack.push([row_num + 1, col_num]);
      }
      // Проверка верхней клетки
      if (col_num + 1 < 16) {
        let sq_2 = squares[row_num][col_num + 1];
        if (!sq_2.isMine && !sq_2.isRevealed)
          fillStack.push([row_num, col_num + 1]);
      }
      // Проверка левой клетки
      if (row_num - 1 >= 0) {
        let sq_3 = squares[row_num - 1][col_num];
        if (!sq_3.isMine && !sq_3.isRevealed)
          fillStack.push([row_num - 1, col_num]);
      }
      // Проверка нижней клетки
      if (col_num - 1 >= 0) {
        let sq_4 = squares[row_num][col_num - 1];
        if (!sq_4.isMine && !sq_4.isRevealed)
          fillStack.push([row_num, col_num - 1]);
      }
      // Проверка нижней левой клетки
      if (col_num - 1 >= 0 && row_num - 1 >= 0) {
        let sq_4 = squares[row_num - 1][col_num - 1];
        if (!sq_4.isMine && !sq_4.isRevealed)
          fillStack.push([row_num - 1, col_num - 1]);
      }
      // Проверка нижней правой клетки
      if (col_num - 1 >= 0 && row_num + 1 < 16) {
        let sq_4 = squares[row_num + 1][col_num - 1];
        if (!sq_4.isMine && !sq_4.isRevealed)
          fillStack.push([row_num + 1, col_num - 1]);
      }
      // Проверка левой верхней клетки
      if (col_num + 1 < 16 && row_num - 1 >= 0) {
        let sq_4 = squares[row_num - 1][col_num + 1];
        if (!sq_4.isMine && !sq_4.isRevealed)
          fillStack.push([row_num - 1, col_num + 1]);
      }
      // Проверка правой верхней клетки
      if (col_num + 1 < 16 && row_num + 1 < 16) {
        let sq_4 = squares[row_num + 1][col_num + 1];
        if (!sq_4.isMine && !sq_4.isRevealed)
          fillStack.push([row_num + 1, col_num + 1]);
      }
    }
  }
}

// Открытие ближайших ячеек______________________________
function openNearNumber(row, col) {
  let square = squares[row][col];

  if (!square.isRevealed) {
    if (square.isDigit) {
      square.element.classList.add(`digit_${square.numOfNeighbouringMines}`);
    } else square.element.classList.add("field__empty");

    square.isRevealed = true;
    numOfRevealed++;
  }
}

// Создание сетки клеток_________________________________
function createBoard() {
  for (let i = 0; i < numOfRows; i++) {
    squares[i] = [];
    for (let j = 0; j < numOfCols; j++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.row = i;
      square.dataset.col = j;
      square.addEventListener("mousedown", handlePress);
      square.addEventListener("mouseup", handleClick);
      square.addEventListener("contextmenu", handleRightClick);
      document.addEventListener("mouseup", handleGlobalClick);
      gameField.appendChild(square);
      squares[i][j] = {
        element: square,
        isMine: false,
        isDigit: false,
        isRevealed: false,
        isFlagged: false,
        isQuestioned: false,
        numOfNeighbouringMines: 0,
      };
    }
  }
}

// Подсчет пустых клеток_________________________________
function revealSquare(square) {
  if (square.isRevealed || square.isFlagged) return;

  if (square.isDigit) {
    square.element.classList.add("digit");
    square.element.classList.add(`digit_${square.numOfNeighbouringMines}`);
  } else square.element.classList.add("field__empty");

  square.isRevealed = true;
  numOfRevealed++;
}

// Изменение смайлика при зажатии клетки поля____________
function handlePress(event) {
  if (
    !event.target.classList.contains("flagged") &&
    !event.target.classList.contains("questioned")
  ) {
    if (event.button === 0) {
      emoticon.src = "images/emoticonsButtons/btnScared.png";
    }
  }
}

// Изменение поведения смайлика в случае наведения мыши__
// за пределы поля_______________________________________
function handleGlobalClick(event) {
  if (event.button === 0 && !gameEnded) {
    emoticon.src = "images/emoticonsButtons/btnRestart.png";
  }
}

// Поведение различных элементов игры по левому клику____
function handleClick(event) {
  if (event.button === 0) {
    // Изменение смайлика при зажатии клетки поля
    emoticon.src = "images/emoticonsButtons/btnRestart.png";

    // Проверка на окончание игры
    if (gameEnded) {
      return;
    }

    // Получение координат кликнутой клетки
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const square = squares[row][col];

    // Проверка на клетки, уже помеченные флагом или вопросом
    if (square.isFlagged || square.isQuestioned) {
      return;
    }

    // Проверка, есть ли в клетке мина и вызов окончания игры с проигрышем
    if (square.isMine) {
      hasWon = false;
      gameEnded = true;
      square.element.classList.add("bomb__expoled");
      gameOver();
    }

    // Проверка, не окончена ли игра
    if (!gameEnded) {
      // Заполнение пустыми клетками
      revealSquare(square);

      // Запуск таймера
      if (numOfRevealed == 1) {
        startTimer();
      }

      // Генерация мин
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

        // Подсчет количества ближайших мин для каждой клетки
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
                  squares[i][j].isDigit = true;
                }
              }
            }
          }
        }
      }

      // Добавление цифр количества мин поблизости для открытых клеток
      if (square.isDigit)
        square.element.classList.add(`digit_${square.numOfNeighbouringMines}`);

      // Проверка соседних клеток
      if (!square.isDigit) {
        checkNear(Number(row), Number(col));
      }

      // Проверка на победу в игре
      if (numOfRevealed === numOfRows * numOfCols - numOfMines) {
        gameEnded = true;
        hasWon = true;
        gameOver();
      }
    }
  }
}

// Поведение различных элементов игры по правому клику___
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
      const markSound = new Audio("sounds/mark_flag_or_question.mp3");
      markSound.play();
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

// Подсчет мин___________________________________________
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

// Реализация таймера____________________________________
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
  timer = setInterval(() => {
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
    seconds--;
    timerUnits.src = `images/timerDigits/timerDigit_${units}.png`;
    timerDozens.src = `images/timerDigits/timerDigit_${dozens}.png`;
    timerHundreds.src = `images/timerDigits/timerDigit_${hundreds}.png`;
    const tickingSound = new Audio("sounds/timer_ticking.mp3");
    tickingSound.play();
  }, 1000);
}

// Перезагрузка игры_____________________________________
function gameReset() {
  // 1. Сброс переменных
  counter = 40;
  units = 0;
  dozens = 0;
  hundreds = 0;
  numOfRevealed = 0;
  seconds = 999;
  // 2. Сброс поля
  for (let i = 0; i < numOfRows; i++)
    for (let j = 0; j < numOfCols; j++) squares[i][j].element.remove();
  squares = [];
  createBoard();
  gameEnded = false;
  // 3. Сброс таймера
  timerUnits.src = `images/timerDigits/timerDigit_0.png`;
  timerDozens.src = `images/timerDigits/timerDigit_0.png`;
  timerHundreds.src = `images/timerDigits/timerDigit_0.png`;
  clearInterval(timer);
  // 4. Сброс счетчика мин
  counterUnits.src = `images/timerDigits/timerDigit_0.png`;
  counterDozens.src = `images/timerDigits/timerDigit_4.png`;
  // 5. Остановка звука конца игры
  endGameSound.pause();
}
// 6. Поведение смайлика при нажатии и отжатии
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
    gameReset();
  }
}

// Конец игры____________________________________________
let endGameSound;

function toggleSound() {
  if (endGameSound.paused) {
    endGameSound.play();
  } else {
    endGameSound.pause();
  }
}

function gameOver() {
  if (hasWon) {
    endGameSound = new Audio("sounds/win_sound.mp3");
    emoticon.src = "images/emoticonsButtons/btnWin.png";
    for (let i = 0; i < numOfRows; i++) {
      for (let j = 0; j < numOfCols; j++) {
        squares[i][j].element.style.pointerEvents = "none";
      }
    }
    showResult();
    toggleSound();
  } else {
    endGameSound = new Audio("sounds/bomb_exploded.mp3");
    endGameSound.play();
    emoticon.src = "images/emoticonsButtons/btnLose.png";
    showResult();
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
  }
  setFinalPoints();
}

// Кастомное модальное окно______________________________
function showResult() {
  setTimeout(function () {
    var resultModal = document.createElement("div");
    resultModal.style.position = "fixed";
    resultModal.style.top = "0";
    resultModal.style.left = "0";
    resultModal.style.width = "100%";
    resultModal.style.height = "100%";
    resultModal.style.backgroundColor = "rgba(0, 0, 0, 0)";
    resultModal.style.opacity = "0";
    resultModal.style.display = "flex";
    resultModal.style.justifyContent = "center";
    resultModal.style.alignItems = "center";
    resultModal.style.zIndex = "999";
    resultModal.style.transition =
      "background-color 0.5s ease, opacity 0.5s ease";

    const resultText = document.createElement("h1");
    resultText.style.color = "#fff";
    resultText.style.fontSize = "5rem";
    resultText.style.textAlign = "center";

    if (hasWon) {
      resultText.textContent = "Поздравляем, ты победил!!! :)";
      resultModal.style.backgroundColor = "rgba(0, 128, 0, 0.5)";
    } else {
      resultText.textContent = "Ты проиграл, попробуй еще раз!";
      resultModal.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    }

    const closeButton = document.createElement("button");
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.color = "#fff";
    closeButton.style.fontSize = "2rem";
    closeButton.style.padding = "1rem";
    closeButton.style.cursor = "pointer";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", function () {
      resultModal.style.opacity = "0";
      setTimeout(function () {
        document.body.removeChild(resultModal);
      }, 300);
    });

    resultModal.appendChild(resultText);
    resultModal.appendChild(closeButton);
    document.body.appendChild(resultModal);

    setTimeout(function () {
      resultModal.style.opacity = "1";
    }, 100);
  }, 500);
}

// Занесение и получение итоговых очков пользователя_____
// за все игры___________________________________________
const totalGamesElement = document.getElementById("total_games");
const winsElement = document.getElementById("wins");
const lossesElement = document.getElementById("losses");
const fastestGameElement = document.getElementById("fastest_game");

function setFinalPoints() {
  let finalPoints = JSON.parse(localStorage.getItem("finalPoints"));
  if (!finalPoints) {
    finalPoints = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      fastestGame: 0,
    };
  }

  if (gameEnded) {
    finalPoints.totalGames++;
  }
  if (hasWon) {
    finalPoints.wins++;
    if (
      finalPoints.fastestGame !== 0 &&
      finalPoints.fastestGame < 999 - seconds
    ) {
      return;
    } else {
      finalPoints.fastestGame = 999 - seconds;
    }
  } else {
    finalPoints.losses++;
  }

  totalGamesElement.textContent = ` ${finalPoints.totalGames}`;
  winsElement.textContent = ` ${finalPoints.wins}`;
  lossesElement.textContent = ` ${finalPoints.losses}`;
  fastestGameElement.textContent = ` ${finalPoints.fastestGame}`;

  localStorage.setItem("finalPoints", JSON.stringify(finalPoints));
}

// Очищение localStorage________________________________
const resetResultsBtn = document.querySelector(".reset_results");
resetResultsBtn.addEventListener("click", function () {
  localStorage.clear();
  totalGamesElement.textContent = " 0";
  winsElement.textContent = " 0";
  lossesElement.textContent = " 0";
  fastestGameElement.textContent = " 0";
});

// Запрос имени пользователя_____________________________
const playerName = prompt("Как вас зовут?");
const userName = document.getElementById("user_name");
if (!playerName) {
  userName.textContent = "Игрок,";
} else {
  userName.textContent = `${playerName.trim()},`;
}

// Вызов игры____________________________________________
createBoard();
