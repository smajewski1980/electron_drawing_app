const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color-input");
const strokeInput = document.getElementById("stroke");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
let isDrawing = false;
let pickedColor;
let strokeWidth = 1;
let x;
let y;

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

// capture the point where the cursor touches the canvas
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

// if the mouse is pressed draw when the mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
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

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => {
  saveTest();
});

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
