// select the game div and create a 64x64 grid inside of it
// scale each item in the grid based on width of the game div

// start coding
// create a 64x64 grid
// create a score
// create a game loop
// create a game over

// create a 64x64 grid
const game = document.querySelector("#game");

// console log that the game div has been selected
console.log(game);

const score = document.querySelector(".score");
const grid = document.createElement("div");
const gridWidth = 64;
const gridHeight = 64;
const gridArea = gridWidth * gridHeight;
const gridItems = [];

// grid.classList.add("grid");
game.appendChild(grid);

for (let i = 0; i < gridArea; i++) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridItems.push(gridItem);
  grid.appendChild(gridItem);
}

// add styles
grid.style.width = "100%";
grid.style.display = "grid";

// make grid height same as width in pixels
const gridWidthPixels = grid.clientWidth;
grid.style.height = `${gridWidthPixels}px`;

grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
grid.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;

// give each grid item a width and height scaling to the grid width and remove margin and padding
gridItems.forEach((item) => {
  item.style.margin = "0";
  item.style.padding = "0";
  item.style.width = grid.style.width / gridWidth;
  item.style.height = grid.style.height / gridHeight;
  //   give border to each grid item
  item.style.border = "1px solid black";
  //   color each item in the grid orange
  item.style.backgroundColor = "orange";
});

// if grid item is clicked, toggle color
gridItems.forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("clicked");
  });
});

// define a vertex table
const vertexTable = [];

// function to add vertex to vertex table
const addVertex = (vertex) => {
  vertexTable.push(vertex);
};

// define an edge table
const edgeTable = [];

// function to add edge to edge table
const addEdge = (edge) => {
  // make sure edge is an array of length two with two vertexes
  edgeTable.push(edge);
};

addVertex([0, 0, 1]);
addVertex([0, 8, 1]);
addVertex([8, 8, 1]);
addVertex([8, 0, 1]);

addEdge([0, 1]);
addEdge([1, 2]);
addEdge([2, 3]);
addEdge([3, 0]);

// define a function to draw a point, offset so that 0,0 is at the center of the grid, and it's oriented correctly
const drawPoint = (vertex, color = "white") => {
  const x = vertex[0];
  const y = vertex[1];
  const xNew = x + gridWidth / 2;
  const yNew = gridHeight / 2 - y;
  const index = Math.round(xNew + yNew * gridWidth);
  gridItems[index].style.backgroundColor = color;
};

const drawLine = (vertex1, vertex2, color = "grey") => {
  var x0 = Math.round(vertex1[0]);
  var y0 = Math.round(vertex1[1]);
  var x1 = Math.round(vertex2[0]);
  var y1 = Math.round(vertex2[1]);
  var dx = Math.abs(x1 - x0);
  var dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1;
  var sy = y0 < y1 ? 1 : -1;

  var err = dx - dy;

  while (true) {
    drawPoint([x0, y0], color);

    if (x0 === x1 && y0 === y1) break;
    if (Math.abs(x0 - x1) < 0.0001 && Math.abs(y0 - y1) < 0.0001) break;
    var e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

// define a function to draw the vertices and edges of the vertex table onto the grid
const drawVertexTable = (vertexTable, colorOne = "grey", colorTwo = "blue") => {
  edgeTable.forEach((edge) => {
    const vertex1 = vertexTable[edge[0]];
    const vertex2 = vertexTable[edge[1]];
    drawLine(vertex1, vertex2, colorOne);
  });
  vertexTable.forEach((vertex) => {
    drawPoint(vertex, colorTwo);
  });
};

// define a function to perform matrix transaformations on the vertex table that returns a new table
const matrixTransform = (vertexTable, matrix) => {
  const newVertexTable = [];
  vertexTable.forEach((vertex) => {
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];
    const xNew = Math.round(
      matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z
    );
    const yNew = Math.round(
      matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z
    );
    const zNew = Math.round(
      matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z
    );
    newVertexTable.push([xNew, yNew, zNew]);
  });
  return newVertexTable;
};

// define a function to do perspective projection on the vertex table that returns a new table
const perspectiveProjection = (vertexTable) => {
  const newVertexTable = [];
  vertexTable.forEach((vertex) => {
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];
    const xNew = x / z;
    const yNew = y / z;
    const zNew = z / z;
    newVertexTable.push([xNew, yNew, zNew]);
  });
  return newVertexTable;
};

// generate a random shear matrix
const randomShearMatrix = () => {
  const shearMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const shearDirection = Math.floor(Math.random() * 2);
  const shearAmount = Math.random() * 6 - 3;
  if (shearDirection === 0) {
    shearMatrix[0][1] = shearAmount;
  } else {
    shearMatrix[1][0] = shearAmount;
  }
  return shearMatrix;
};

const randomScalingMatrix = () => {
  const scalingMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const scalingAmount = Math.random() * 2 + 1;
  scalingMatrix[0][0] = scalingAmount;
  scalingMatrix[1][1] = scalingAmount;
  return scalingMatrix;
};

// generate a random rotation matrix
const randomRotationMatrix = () => {
  const rotationMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const rotationAngle = Math.random() * 2 * Math.PI;
  rotationMatrix[0][0] = Math.cos(rotationAngle);
  rotationMatrix[0][1] = -Math.sin(rotationAngle);
  rotationMatrix[1][0] = Math.sin(rotationAngle);
  rotationMatrix[1][1] = Math.cos(rotationAngle);
  return rotationMatrix;
};

// generate a random translation matrix
const randomTranslationMatrix = () => {
  const translationMatrix = [
    [1, 0, Math.random() * 16 - 8],
    [0, 1, Math.random() * 16 - 8],
    [0, 0, 1],
  ];
  return translationMatrix;
};

// generate a random matrix transformation matrix by choosing one of the above functions at random
const randomTransformationMatrix = () => {
  const randomSelection = Math.floor(Math.random() * 4);
  const randomMatrixTransformationMatrix = [
    randomTranslationMatrix(),
    randomScalingMatrix(),
    randomRotationMatrix(),
    randomShearMatrix(),
  ][randomSelection];
  return [randomMatrixTransformationMatrix, randomSelection];
};

// function to clear the grid
const clearGrid = () => {
  gridItems.forEach((item) => {
    item.style.backgroundColor = "orange";
  });
};

drawVertexTable(vertexTable);

// perform a shear transformation on the vertex table
const shearMatrix = randomTransformationMatrix()[0];

console.log(shearMatrix);
shearedTable = matrixTransform(vertexTable, shearMatrix);

// log the vertex table
console.log(shearedTable);

drawVertexTable(shearedTable, "white", "red");

// clear the grid
clearGrid();

// select the element with id "Timer", and then set it to 3 minutes and count down
const timer = document.querySelector("#timer");
timer.innerHTML = "3:00";

// define a function to convert seconds to minutes and seconds
const secondsToMinutesAndSeconds = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft}`;
};

const startingLives = 3;
let lives = startingLives;
let coins = 0;

// define a function to count down from 3 minutes, at one minute left, add the class "is-error" to the timer
const countDown = () => {
  let seconds = 180;
  const interval = setInterval(() => {
    seconds--;
    timer.innerHTML = secondsToMinutesAndSeconds(seconds);
    if (seconds === 60) {
      timer.classList.add("is-error");
    }
    if (seconds === 0) {
      clearInterval(interval);
      timer.innerHTML = "GAME OVER";
      // make it blink
      timer.classList.remove("is-error");
      setTimeout(() => {
        timer.classList.add("is-error");
        timer.classList;
      }, 50);
      timer.style.display = "none";

      // hide the game bar
      document.querySelector(".game-bar").style.display = "none";

      // hide the game
      game.style.display = "none";

      // hide the transform buttons
      translateButton.style.display = "none";
      shearButton.style.display = "none";
      scaleButton.style.display = "none";
      rotateButton.style.display = "none";
      guessButton.style.display = "none";

      // show the game over screen
      document.querySelector("#game-over").removeAttribute("hidden");
      document.querySelector("#score").innerHTML = coins;
    }
  }, 1000);
};

myTimer = countDown();

// select the lives div
const livesDiv = document.querySelector("#lives");

// select the coins span
const coinsSpan = document.querySelector("#coins");

// define a function to update the lives div
const updateLives = () => {
  let heartHTML = '<i class="nes-icon is-medium heart"></i>';
  let transparentHeartHTML =
    '<i class="nes-icon is-medium heart is-transparent"></i>';
  livesDiv.innerHTML =
    heartHTML.repeat(lives) +
    transparentHeartHTML.repeat(startingLives - lives);
};

// define a function to update the coins span
const updateCoins = () => {
  coinsSpan.innerHTML = coins;
};

updateLives();
updateCoins();

// select the Translate, Shear, Scale, and Rotate buttons
const translateButton = document.querySelector("#translate");
const shearButton = document.querySelector("#shear");
const scaleButton = document.querySelector("#scale");
const rotateButton = document.querySelector("#rotate");

// select the transformation-matrix div
const transformationMatrixDiv = document.querySelector(
  ".transformation-matrix"
);

const resetTransformationMatrixDiv = () => {
  // add the hidden attribute
  transformationMatrixDiv.setAttribute("hidden", "");

  const inputs = Array.from(transformationMatrixDiv.querySelectorAll("input"));

  // clear class on each of the inputs
  inputs.forEach((input) => {
    input.classList.remove("is-success");
    input.classList.remove("is-error");
    input.setAttribute("disabled", "");
    input.value = 0;
  });
};

// function to setTranslateMatrixDiv
const updateTransformationMatrixDiv = (matrix) => {
  transformationMatrixDiv.removeAttribute("hidden");

  const inputs = Array.from(transformationMatrixDiv.querySelectorAll("input"));

  // loop through the inputs and set the value to the corresponding matrix element
  inputs.forEach((input, index) => {
    let matrixValue = matrix[Math.floor(index / 3)][index % 3];
    if (matrixValue == null) {
      // remove disabled attribute
      input.removeAttribute("disabled");
      // add the is-error class
      input.classList.add("is-error");
    } else {
      input.value = matrixValue;
    }
  });
};

const extractMatrixValues = () => {
  const inputs = Array.from(transformationMatrixDiv.querySelectorAll("input"));
  const matrix = [
    [inputs[0].value, inputs[1].value, inputs[2].value],
    [inputs[3].value, inputs[4].value, inputs[5].value],
    [inputs[6].value, inputs[7].value, inputs[8].value],
  ];
  return matrix;
};

// check matrices for similarity and return the absolute difference
const matrixSimilarity = (matrix1, matrix2) => {
  let difference = 0;
  matrix1.forEach((row, rowIndex) => {
    row.forEach((element, columnIndex) => {
      difference += Math.abs(element - matrix2[rowIndex][columnIndex]);
    });
  });
  return difference;
};

// select the guess button
const guessButton = document.querySelector("#guess");

// define a function to start a new stage of the game
const newStage = () => {
  clearGrid();
  drawVertexTable(vertexTable);
  let [transformationMatrix, transformationMatrixType] =
    randomTransformationMatrix();
  let transformedTable = matrixTransform(vertexTable, transformationMatrix);
  drawVertexTable(transformedTable, "white", "red");
  let guessType;
  // add listeners to the buttons
  translateButton.addEventListener("click", () => {
    guessType = 0;
    // disable the current button by adding the is-disabled class and the disabled attribute
    translateButton.classList.add("is-disabled");
    // enable all the other buttons by removing the is-disabled class
    shearButton.classList.remove("is-disabled");
    scaleButton.classList.remove("is-disabled");
    rotateButton.classList.remove("is-disabled");
    guessButton.classList.remove("is-disabled");

    if (coins >= 10) {
      resetTransformationMatrixDiv();
      updateTransformationMatrixDiv([
        [1, 0, null],
        [0, 1, null],
        [0, 0, 1],
      ]);
    }
  });
  scaleButton.addEventListener("click", () => {
    guessType = 1;
    scaleButton.classList.add("is-disabled");

    // enable all the other buttons by removing the is-disabled class
    translateButton.classList.remove("is-disabled");
    shearButton.classList.remove("is-disabled");
    rotateButton.classList.remove("is-disabled");
    guessButton.classList.remove("is-disabled");
    if (coins >= 10) {
      resetTransformationMatrixDiv();
      updateTransformationMatrixDiv([
        [null, 0, 0],
        [0, null, 0],
        [0, 0, 1],
      ]);
    }
  });
  rotateButton.addEventListener("click", () => {
    guessType = 2;
    rotateButton.classList.add("is-disabled");
    // enable all the other buttons by removing the is-disabled class
    translateButton.classList.remove("is-disabled");
    shearButton.classList.remove("is-disabled");
    scaleButton.classList.remove("is-disabled");
    guessButton.classList.remove("is-disabled");
    if (coins >= 10) {
      resetTransformationMatrixDiv();
      updateTransformationMatrixDiv([
        [null, null, 0],
        [null, null, 0],
        [0, 0, 1],
      ]);
    }
  });
  shearButton.addEventListener("click", () => {
    guessType = 3;
    shearButton.classList.add("is-disabled");
    // enable all the other buttons by removing the is-disabled class
    translateButton.classList.remove("is-disabled");
    scaleButton.classList.remove("is-disabled");
    rotateButton.classList.remove("is-disabled");
    guessButton.classList.remove("is-disabled");
    if (coins >= 10) {
      resetTransformationMatrixDiv();
      updateTransformationMatrixDiv([
        [1, null, 0],
        [null, 1, 0],
        [0, 0, 1],
      ]);
    }
  });
  // add listener to the guess button
  guessButton.addEventListener("click", () => {
    if (
      (guessType === transformationMatrixType && coins <= 10) ||
      (coins > 10 &&
        matrixSimilarity(extractMatrixValues(), transformationMatrix) < 1)
    ) {
      console.log("correct");
      coins++;
      updateCoins();
    } else {
      console.log("incorrect");
      lives--;
      updateLives();
      if (lives === 0) {
        // hide the timer
        timer.style.display = "none";

        // hide the game bar
        document.querySelector(".game-bar").style.display = "none";

        // hide the game
        game.style.display = "none";

        // hide the transform buttons
        translateButton.style.display = "none";
        shearButton.style.display = "none";
        scaleButton.style.display = "none";
        rotateButton.style.display = "none";
        guessButton.style.display = "none";

        // show the game over screen
        document.querySelector("#game-over").removeAttribute("hidden");
        document.querySelector("#score").innerHTML = coins;
      }
    }
    clearGrid();
    [transformationMatrix, transformationMatrixType] =
      randomTransformationMatrix();
    drawVertexTable(vertexTable);
    transformedTable = matrixTransform(vertexTable, transformationMatrix);
    drawVertexTable(transformedTable, "white", "red");

    // reset disabled states of buttons
    translateButton.classList.remove("is-disabled");
    shearButton.classList.remove("is-disabled");
    scaleButton.classList.remove("is-disabled");
    rotateButton.classList.remove("is-disabled");

    // make sure the guess button is disabled
    guessButton.classList.add("is-disabled");

    // reset the transformation matrix div
    resetTransformationMatrixDiv();
  });
};

newStage();
