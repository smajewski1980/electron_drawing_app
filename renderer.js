const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color-input");
const bgColorInput = document.getElementById("bg-color-input");
const strokeInput = document.getElementById("stroke");
const brushBtn = document.getElementById("brush-btn");
const cloneBtn = document.getElementById("clone-btn");
const eraserBtn = document.getElementById("eraser-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const eraserCheckBox = document.getElementById("eraser");
const loadImgInput = document.getElementById("load-img-input");
const toolOptionsDiv = document.querySelector(".tool-options");
let isDrawing = false;
let pickedColor;
let strokeWidth = 1;
let x;
let y;
let tool = "brush";
let cloneImage = undefined;
let undoStack = [];
let redoStack = [];
let showToolOptions = false;
ctx.imageSmoothingEnabled = false;

// just found out about JSDocs...
/**
 * Turns the canvas to a data url
 * and pushes it to the undo stack
 * @returns {void}
 */
function saveState() {
  const dataUrl = canvas.toDataURL();
  undoStack.push(dataUrl);
}

function handleToolOptions() {
  if (showToolOptions) {
    document.startViewTransition(() => {
      toolOptionsDiv.style.top = "1rem";
    });
    // toolOptionsDiv.classList.add("displaying");
  } else {
    document.startViewTransition(() => {
      toolOptionsDiv.style.top = "-100%";
    });
  }
}

/**
 *
 * @param {string} str
 * @returns {void}
 */
function setCursor(str) {
  document.body.className = "";
  document.body.classList.add(str);
}
setCursor(tool);

/**
 * disables the fg color picker
 */
function disableFgColor() {
  const label = colorInput.labels[0];
  label.inert = true;
  label.style.opacity = 0.4;
  colorInput.inert = true;
  colorInput.style.opacity = 0.4;
}

/**
 * reenables the fg color picker
 */
function reenableFgColor() {
  const label = colorInput.labels[0];
  colorInput.inert = false;
  label.inert = false;
  colorInput.style.opacity = 1;
  label.style.opacity = 1;
}

/**
 * Handles the undo action
 * @returns {void}
 */
function undo() {
  if (undoStack.length === 0) return;
  if (undoStack.length > 1) {
    const curr = undoStack.pop();
    redoStack.push(curr);
    const prevUrl = undoStack[undoStack.length - 1];
    const img = new Image();
    img.src = prevUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  } else {
    const curr = undoStack.pop();
    redoStack.push(curr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// capture the point where the cursor touches the canvas
canvas.addEventListener("mousedown", (e) => {
  x = Math.floor(e.offsetX);
  y = Math.floor(e.offsetY);
  isDrawing = true;

  if (tool === "clone" && !isCanvasBlank(canvas)) {
    if (!cloneImage) {
      // set clone image
      cloneImage = ctx.getImageData(x - 18, y - 18, 36, 36);
    } else {
      // apply image to canvas
      ctx.putImageData(cloneImage, x - 18, y - 18);
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
    ctx.strokeStyle = pickedColor || "white";
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
  saveState();
  redoStack = [];
});

// listeners for the UI controls
colorInput.addEventListener("change", (e) => {
  pickedColor = e.target.value;
});

strokeInput.addEventListener("change", (e) => {
  strokeWidth = Number(e.target.value);
});

clearBtn.addEventListener("click", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
  canvas.style.backgroundColor = "#202020";
  bgColorInput.value = "#202020";
  colorInput.value = "#ffffff";
  pickedColor = "#ffffff";
  tool = "brush";
  setCursor(tool);
  reenableFgColor();
  cloneImage = undefined;
});

saveBtn.addEventListener("click", (e) => {
  saveCanvas();
});

bgColorInput.addEventListener("change", (e) => {
  const newBgColor = e.target.value;
  canvas.style.backgroundColor = newBgColor;
});

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

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
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
  setCursor(tool);
  reenableFgColor();
  showToolOptions = false;
  handleToolOptions();
});

cloneBtn.addEventListener("click", () => {
  tool = "clone";
  setCursor(tool);
  disableFgColor();
  showToolOptions = true;
  handleToolOptions();
});

eraserBtn.addEventListener("click", () => {
  tool = "eraser";
  setCursor(tool);
  disableFgColor();
  showToolOptions = false;
  handleToolOptions();
});
