var WALL = "WALL";
var FLOOR = "FLOOR";
var BALL = "BALL";
var GAMER = "GAMER";
var PASS = "PASS";
var TOXIC = "TOXIC";
var SICK = "SICK";

//imgs
var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var TOXIC_IMG = '<img src="img/toxic.png" />';
var GAMER_SICK_IMG = '<img src="img/gamer-sick.png" />';

const elBallCount = document.querySelector(".ball-count");
const elModal = document.querySelector(".modal");
const elContainer = document.querySelector(".container");
const kickSound = document.getElementById("kick-sample");

//passes
var gPassUp;
var gPassDown;
var gPassLeft;
var gPassRight;
// model
var gBoard;
var gGamerPos;
//interval and time
var gIntervarl;
var gIntervarl1;
var gClearInterval;
var gTimeOut1;
var gTimeOut2;

//elements
var gBallCount;
var gBallOnBoard;
var gIsGlued;

function initGame() {
  elModal.classList.add("hidden");
  resetDom();

  gPassUp = {
    i: 0,
    j: 6,
  };
  gPassDown = {
    i: 9,
    j: 6,
  };
  gPassLeft = {
    i: 4,
    j: 0,
  };
  gPassRight = {
    i: 4,
    j: 11,
  };
  gGamerPos = { i: 2, j: 9 };

  gBallCount = 0;
  gBallOnBoard = 0;
  gBoard = buildBoard();
  renderBoard(gBoard);

  gIntervarl1 = setInterval(renderRandomEl, 1000, gBoard, BALL);
  gIntervarl = setInterval(renderRandomEl, 5000, gBoard, TOXIC);
}

function buildBoard() {
  // Create the Matrix
  var board = createMat(10, 12);

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null };

      // Place Walls at edges
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        cell.type = WALL;
      }

      // Add created cell to The game board
      board[i][j] = cell;
    }
  }

  // Place the gamer at selected position
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  //place the pass
  board[gPassUp.i][gPassUp.j].gameElement = PASS;
  board[gPassDown.i][gPassDown.j].gameElement = PASS;
  board[gPassLeft.i][gPassLeft.j].gameElement = PASS;
  board[gPassRight.i][gPassRight.j].gameElement = PASS;
  //update type
  board[gPassUp.i][gPassUp.j].type = FLOOR;
  board[gPassDown.i][gPassDown.j].type = FLOOR;
  board[gPassLeft.i][gPassLeft.j].type = FLOOR;
  board[gPassRight.i][gPassRight.j].type = FLOOR;

  // Place the Balls (currently randomly chosen positions)

  console.log(board);
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // TODO - change to short if statement
      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";

      //TODO - Change To template string
      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        "," +
        j +
        ')" >\n';

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      } else if (currCell.gameElement === SICK) {
        strHTML += GAMER_SICK_IMG;
      }
      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  if (gIsGlued) return;

  if (i < 0) {
    renderCell(gGamerPos, "");
    gGamerPos.i = 9;
    updateCell();
    return;
  }
  if (i > 9) {
    renderCell(gGamerPos, "");
    gGamerPos.i = 0;
    updateCell();
    return;
  }
  if (j < 0) {
    renderCell(gGamerPos, "");
    gGamerPos.j = 11;
    updateCell();
    return;
  }
  if (j > 11) {
    renderCell(gGamerPos, "");
    gGamerPos.j = 0;
    updateCell();
    return;
  }

  var targetCell = gBoard[i][j];

  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BALL) {
      kickSound.play();
      gBallOnBoard--;
      gBallCount++;
      elBallCount.innerHTML = gBallCount;

      if (gBallOnBoard === 0) {
        gClearInterval = clearInterval(gIntervarl1);
        clearInterval(gIntervarl);
        showModal();
      }
    }
    if (targetCell.gameElement === TOXIC) {
      gIsGlued = true;

      console.log("Glued");
      clearTimeout(gTimeOut1);
      clearTimeout(gTimeOut2);
      setTimeout(() => (gIsGlued = false), 3000);
    }

    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, "");

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    var elCurrGamer = gIsGlued ? GAMER_SICK_IMG : GAMER_IMG;
    renderCell(gGamerPos, elCurrGamer);
  } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = "." + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function getRandomPos(board) {
  var pos = {
    i: getRandomInt(1, board.length - 2),
    j: getRandomInt(1, board.length - 2),
  };

  return pos;
}

function renderRandomEl(board, element) {
  var elImg = element === BALL ? BALL_IMG : TOXIC_IMG;
  var pos = getRandomPos(board);

  while (board[pos.i][pos.j].gameElement !== null) {
    pos = getRandomPos();
  }

  board[pos.i][pos.j].gameElement = element;

  renderCell(pos, elImg);
  if (element === BALL) gBallOnBoard++;

  if (element === TOXIC) {
    gTimeOut2 = setTimeout(renderCell, 3000, pos, "");
    gTimeOut1 = setTimeout(
      () => (board[pos.i][pos.j].gameElement = null),
      3000
    );
  }
}

function showModal() {
  elModal.classList.remove("hidden");
}

function resetDom() {
  elBallCount.innerText = 0;
}

function updateCell() {
  gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
  renderCell(gGamerPos, GAMER_IMG);
}

// function playerSick() {
//   gBoard[gGamerPos.i][gGamerPos.j].gameElement = SICK;
//   renderCell(gGamerPos, GAMER_SICK_IMG);
// }
