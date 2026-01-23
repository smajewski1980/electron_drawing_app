import toolFuncs from "./tool-scripts.js";
import utils from "./utils.js";
import colorFuncs from "./colors.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgColorInput = document.getElementById("bg-color-input");
const brushBtn = document.getElementById("brush-btn");
const cloneBtn = document.getElementById("clone-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const loadImgInput = document.getElementById("load-img-input");
const toolOptionsDiv = document.querySelector(".tool-options");
let isDrawing = false;
let strokeWidth = 2;
let x;
let y;
let tool = "";
let cloneImage = undefined;
let cloneSize = "20";
let undoStack = [];
let redoStack = [];
let showToolOptions = false;
ctx.imageSmoothingEnabled = false;

function handleToolOptions() {
  if (showToolOptions) {
    document.startViewTransition(() => {
      toolOptionsDiv.style.top = "1rem";
      switch (tool) {
        case "brush":
          toolFuncs.loadBrushOptions(
            strokeWidth,
            (newStrokeWidth) => (strokeWidth = newStrokeWidth),
          );
          break;
        case "clone":
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
    document.startViewTransition(() => {
      toolOptionsDiv.style.top = "-100%";
    });
  }
}

/**
 * Handles the redo action
 * @returns {void}
 */
function redo() {
  if (redoStack.length > 0) {
    const curr = redoStack.pop();
    undoStack.push(curr);
    const img = new Image();
    img.src = curr;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

/**
 * Loads given file onto the canvas,
 * preserving the images aspect ration.
 * @param {file} file
 * @returns {void}
 */
function loadImgOnCanvas(file) {
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = (e) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        img.width = (img.width / img.height) * canvas.height;
        img.height = canvas.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
    };
  } else {
    alert("Please select a valid image file.");
  }
}

/**
 * A function to check if the canvas is blank.
 * @param {canvas} canvas
 * @returns {boolean}
 */
function isCanvasBlank(canvas) {
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;

  return canvas.toDataURL() === blank.toDataURL();
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
  if (!isCanvasBlank(canvas)) {
    if (confirm("resizing the canvas will erase your gorgeous picture...")) {
      return setupCanvas();
    }
  } else {
    setupCanvas();
  }
});

resizeObserver.observe(canvas);

/**
 * Saves the current canvas to a file
 * @returns {void}
 */
function saveCanvas() {
  canvas.toBlob(async (data) => {
    const arrBuff = await data.arrayBuffer();
    const response = await window.saveImage.saveImage("saveImage", arrBuff);
    if (!response) {
      console.log("save dialog was closed");
      return;
    }
    console.log(await response);
  }, "image/png");
}

// capture the point where the cursor touches the canvas
canvas.addEventListener("mousedown", (e) => {
  x = Math.floor(e.offsetX);
  y = Math.floor(e.offsetY);
  isDrawing = true;

  if (tool === "clone" && !isCanvasBlank(canvas)) {
    if (!cloneImage) {
      // set clone image
      cloneImage = ctx.getImageData(
        x - parseInt(cloneSize) / 2,
        y - parseInt(cloneSize) / 2,
        parseInt(cloneSize),
        parseInt(cloneSize),
      );
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
});

// if mouse leaves the canvas lift the pen
canvas.addEventListener("mouseleave", () => {
  if (isDrawing) {
    isDrawing = false;
  }
});

// if the mouse is pressed draw when the mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && tool === "brush") {
    ctx.strokeStyle = colorFuncs.pickedColor();
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    // like picking the pen up and setting it down in a different spot on the paper, moveTo()
    ctx.moveTo(x, y);
    ctx.lineTo(Math.floor(e.offsetX), Math.floor(e.offsetY));
    ctx.stroke();
    ctx.closePath();
    // set x and y to the current
    x = Math.floor(e.offsetX);
    y = Math.floor(e.offsetY);
  } else if (isDrawing && tool === "eraser") {
    ctx.clearRect(
      Math.floor(e.offsetX),
      Math.floor(e.offsetY),
      strokeWidth + 5,
      strokeWidth + 5,
    );
  }
});

// dont draw after the mouse button is released
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  utils.saveState(canvas, undoStack);
  redoStack = [];
});

clearBtn.addEventListener("click", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
  canvas.style.backgroundColor = "#202020";
  bgColorInput.value = "#202020";
  colorFuncs.setColorInputVal("#ffffff");
  colorFuncs.setPickedColor("#ffffff");
  tool = "";
  strokeWidth = "2";
  toolFuncs.setCursor(tool);
  colorFuncs.reenableFgColor();
  cloneImage = undefined;
  showToolOptions = false;
  handleToolOptions();
});

saveBtn.addEventListener("click", (e) => {
  saveCanvas();
});

bgColorInput.addEventListener("change", (e) => {
  const newBgColor = e.target.value;
  canvas.style.backgroundColor = newBgColor;
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    utils.undo(undoStack, redoStack, ctx);
  }

  if (e.ctrlKey && e.key === "r") {
    redo();
  }
});

loadImgInput.addEventListener("change", (e) => {
  const fileToLoad = e.target.files[0];
  loadImgOnCanvas(fileToLoad);
});

brushBtn.addEventListener("click", () => {
  tool = "brush";
  toolFuncs.setCursor(tool);
  colorFuncs.reenableFgColor();
  showToolOptions = true;
  handleToolOptions();
});

cloneBtn.addEventListener("click", () => {
  tool = "clone";
  cloneSize = "20";
  cloneImage = undefined;
  toolFuncs.setCursor(tool);
  colorFuncs.disableFgColor();
  showToolOptions = true;
  handleToolOptions();
});

eraserBtn.addEventListener("click", () => {
  tool = "eraser";
  toolFuncs.setCursor(tool);
  colorFuncs.disableFgColor();
  showToolOptions = false;
  handleToolOptions();
});
