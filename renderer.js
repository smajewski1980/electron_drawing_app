import toolFuncs from "./tool-scripts.js";
import utils from "./utils.js";
import colorFuncs from "./colors.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorsBtn = document.getElementById("colors-btn");
const brushBtn = document.getElementById("brush-btn");
const cloneBtn = document.getElementById("clone-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const loadImgInput = document.getElementById("load-img-input");
const toolOptionsDiv = document.querySelector(".tool-options");
let isDrawing = false;
let strokeWidth = 2;
let eraserWidth = 8;
let x;
let y;
let tool = "";
let cloneImage = undefined;
let cloneSize = "20";
let undoStack = [];
let redoStack = [];
let showToolOptions = false;
ctx.imageSmoothingEnabled = false;
let brushOpacity = 1;

/**
 * this displays the tool options ui for the current tool
 * @returns {void}
 */
function handleToolOptions() {
  // if the selected tool needs the options menu
  if (showToolOptions) {
    document.startViewTransition(() => {
      // slide in the menu, css has it behind the canvas
      toolOptionsDiv.style.top = "1rem";
      switch (tool) {
        case "colors":
          toolFuncs.loadColorsOptions(canvas);
          break;
        case "brush":
          // called with some callbacks to update items on this page
          toolFuncs.loadBrushOptions(
            strokeWidth,
            (newStrokeWidth) => (strokeWidth = newStrokeWidth),
            false,
            brushOpacity,
            (newBrushOpacity) => (brushOpacity = newBrushOpacity),
          );
          break;
        case "eraser":
          // called with a callback to update an item on this page
          toolFuncs.loadBrushOptions(
            eraserWidth,
            (newEraserWidth) => (eraserWidth = newEraserWidth),
            true,
          );
          break;
        case "clone":
          // called with some callbacks to update items on this page
          toolFuncs.loadCloneOptions(
            cloneImage,
            cloneSize,
            (newCloneImg) => (cloneImage = newCloneImg),
            (newCloneSize) => (cloneSize = newCloneSize),
          );
          break;
        default:
          break;
      }
    });
  } else {
    // if a tool is chosen that does not need the menu, slide it away
    document.startViewTransition(() => {
      toolOptionsDiv.style.top = "-100%";
    });
  }
}

/**
 * The problem this remedies, may only have been occurring
 * because of the lower resolution of my laptop monitor.
 * @returns {void}
 */
function setupCanvas() {
  // Get the device pixel ratio, falling back to 1.
  const dpr = window.devicePixelRatio || 1;

  // Get the size of the canvas in CSS pixels
  const canvasStyles = window.getComputedStyle(canvas);
  const cssWidth = parseFloat(canvasStyles.width);
  const cssHeight = parseFloat(canvasStyles.height);

  // Set the actual canvas buffer size to the scaled dimensions
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Scale the context so drawing commands use the CSS pixel size
  ctx.scale(dpr, dpr);
}
setupCanvas();

/**
 * On resize, if the canvas is not blank, prompt user that
 * resizing will clear the canvas.
 */
const resizeObserver = new ResizeObserver((entries) => {
  if (!utils.isCanvasBlank(canvas)) {
    if (confirm("resizing the canvas will erase your gorgeous picture...")) {
      return setupCanvas();
    }
  } else {
    setupCanvas();
  }
});

resizeObserver.observe(canvas);

/**
 * resets all of the individual items required to start over
 */
function handleStartOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
  canvas.style.backgroundColor = "#202020";
  tool = "";
  strokeWidth = "2";
  eraserWidth = 8;
  brushOpacity = 1;
  toolFuncs.setCursor(tool);
  cloneImage = undefined;
  showToolOptions = false;
  handleToolOptions();
  setTimeout(() => {
    colorFuncs.setPickedColor("#ffffff");
    colorFuncs.clearRecentPallette();
  }, 1000);
}

/**
 * sets the cloneImage, loads the clone options, puts the cloneImage on the canvas
 */
function handleCloneToolAction() {
  if (!cloneImage) {
    // set clone image
    cloneImage = ctx.getImageData(
      x - parseInt(cloneSize) / 2,
      y - parseInt(cloneSize) / 2,
      parseInt(cloneSize),
      parseInt(cloneSize),
    );
    // called with some callbacks to update items on this page
    toolFuncs.loadCloneOptions(
      cloneImage,
      cloneSize,
      (newCloneImg) => (cloneImage = newCloneImg),
      (newCloneSize) => (cloneSize = newCloneSize),
    );
  } else {
    // apply image to canvas
    ctx.putImageData(
      cloneImage,
      x - parseInt(cloneSize) / 2,
      y - parseInt(cloneSize) / 2,
    );
  }
}

/**
 * handles the brush tool drawing to the canvas
 * @param {Event} e
 */
function handleBrushAction(e) {
  ctx.strokeStyle = colorFuncs.pickedColor();
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  // like picking the pen up and setting it down in a different spot on the paper, moveTo()
  ctx.moveTo(x, y);
  ctx.globalAlpha = parseFloat(brushOpacity);
  ctx.lineTo(Math.floor(e.offsetX), Math.floor(e.offsetY));
  ctx.stroke();
  ctx.closePath();
  ctx.globalAlpha = 1;
  // set x and y to the current
  setXandY(e);
}

/**
 * set x and y for any of the mousedown tools
 * @param {Event} e
 */
function setXandY(e) {
  x = Math.floor(e.offsetX);
  y = Math.floor(e.offsetY);
  isDrawing = true;
}

/**
 * handle the selection of the color tool
 * @param {Event} e
 */
function handleColorsBtn(e) {
  tool = "colors";
  showToolOptions = true;
  toolFuncs.setCursor(tool);
  handleToolOptions();
}

/**
 * handle the selection of the brush tool
 * @param {Event} e
 */
function handleBrushBtn(e) {
  tool = "brush";
  toolFuncs.setCursor(tool);
  showToolOptions = true;
  handleToolOptions();
}

/**
 * handle the selection of the clone tool
 * @param {Event} e
 */
function handleCloneBtn(e) {
  tool = "clone";
  cloneSize = "20";
  cloneImage = undefined;
  toolFuncs.setCursor(tool);
  showToolOptions = true;
  handleToolOptions();
}

/**
 * handle the selection of the eraser tool
 * @param {Event} e
 */
function handleEraserBtn(e) {
  tool = "eraser";
  toolFuncs.setCursor(tool);
  showToolOptions = true;
  handleToolOptions();
}

canvas.addEventListener("mousedown", (e) => {
  // capture the point where the cursor touches the canvas
  setXandY(e);

  if (tool === "clone" && !utils.isCanvasBlank(canvas)) {
    handleCloneToolAction();
  }
});
// if mouse leaves the canvas lift the pen
canvas.addEventListener("mouseleave", (e) => {
  if (isDrawing) {
    isDrawing = false;
  }
});
// if the mouse is pressed draw when the mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && tool === "brush") {
    handleBrushAction(e);
  } else if (isDrawing && tool === "eraser") {
    ctx.clearRect(
      Math.floor(e.offsetX),
      Math.floor(e.offsetY),
      eraserWidth + 3,
      eraserWidth + 3,
    );
  }
});
// dont draw after the mouse button is released
canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  utils.saveState(canvas, undoStack);
  redoStack = [];
});
// clear the canvas and reset all values back to start state
clearBtn.addEventListener("click", handleStartOver);
// save the wonderful masterpiece that is the current canvas
saveBtn.addEventListener("click", (e) => {
  utils.saveCanvas(canvas);
});
// listen to the document for the undo and redo key combos
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    utils.undo(undoStack, redoStack, ctx);
  }

  if (e.ctrlKey && e.key === "r") {
    utils.redo(undoStack, redoStack, ctx);
  }
});
// load a file to turn into a masterpiece
loadImgInput.addEventListener("change", (e) => {
  const fileToLoad = e.target.files[0];
  utils.loadImgOnCanvas(fileToLoad, ctx);
});
// tool selection button listeners
colorsBtn.addEventListener("click", handleColorsBtn);
brushBtn.addEventListener("click", handleBrushBtn);
cloneBtn.addEventListener("click", handleCloneBtn);
eraserBtn.addEventListener("click", handleEraserBtn);
