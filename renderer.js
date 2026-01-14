const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color-input");
const bgColorInput = document.getElementById("bg-color-input");
const strokeInput = document.getElementById("stroke");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const eraserCheckBox = document.getElementById("eraser");
let isDrawing = false;
let pickedColor;
let strokeWidth = 1;
let x;
let y;
let isEraser = false;

function isCanvasBlank(canvas) {
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;

  return canvas.toDataURL() === blank.toDataURL();
}

// this may just be because of my crappy laptop monitor...
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
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

// if mouse leaves the canvas lift the pen
canvas.addEventListener("mouseleave", () => {
  if (isDrawing) {
    isDrawing = false;
  }
});

// if the mouse is pressed draw when the mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && !isEraser) {
    ctx.strokeStyle = pickedColor || "white";
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    // like picking the pen up and setting it down in a different spot on the paper, moveTo()
    ctx.moveTo(x, y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.closePath();
    // set x and y to the current
    x = e.offsetX;
    y = e.offsetY;
  } else {
    ctx.clearRect(e.offsetX, e.offsetY, strokeWidth, strokeWidth);
  }
});

// dont draw after the mouse button is released
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
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
});

saveBtn.addEventListener("click", (e) => {
  saveTest();
});

bgColorInput.addEventListener("change", (e) => {
  const newBgColor = e.target.value;
  canvas.style.backgroundColor = newBgColor;
});

// whoops, need to rename this function
function saveTest() {
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

eraserCheckBox.addEventListener("change", (e) => {
  const label = colorInput.labels[0];
  if (e.target.checked) {
    isEraser = true;
    colorInput.inert = true;
    label.inert = true;
    colorInput.style.opacity = 0.4;
    label.style.opacity = 0.4;
  } else {
    isEraser = false;
    colorInput.inert = false;
    label.inert = false;
    colorInput.style.opacity = 1;
    label.style.opacity = 1;
  }
});
