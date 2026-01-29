const utils = {
  /**
   * Turns the canvas to a data url
   * and pushes it to the undo stack
   * @param {HTMLCanvasElement} canvas
   * @param {array} undoStack
   * @returns {void}
   */
  saveState: (canvas, undoStack) => {
    const dataUrl = canvas.toDataURL();
    undoStack.push(dataUrl);
  },
  /**
   * this handles the ctrl + z undo
   * @param {array} undoStack
   * @param {array} redoStack
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  undo: (undoStack, redoStack, ctx) => {
    // early return if the stack is empty
    if (undoStack.length === 0) return;
    if (undoStack.length > 1) {
      // get the top of the stack
      const curr = undoStack.pop();
      // put it on the redo stack
      redoStack.push(curr);
      // take the new top of the stack
      const prevUrl = undoStack[undoStack.length - 1];
      // create an image and draw to the canvas
      const img = new Image();
      img.src = prevUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
      // if only one action in the stack, push to redo stack and clear the canvas
      const curr = undoStack.pop();
      redoStack.push(curr);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  /**
   * this handles the ctrl + r redo
   * @param {array} undoStack
   * @param {array} redoStack
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  redo: (undoStack, redoStack, ctx) => {
    if (redoStack.length > 0) {
      // take off redo stack and put on undo stack
      const curr = redoStack.pop();
      undoStack.push(curr);
      // create an image and draw to canvas
      const img = new Image();
      img.src = curr;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  },
  /**
   * Loads given file onto the canvas,
   * preserving the images aspect ration.
   * @param {File} file
   * @returns {void}
   */
  loadImgOnCanvas: (file, ctx) => {
    if (file && file.type.startsWith("image/")) {
      // get the file into a file reader obj
      const reader = new FileReader();
      reader.readAsDataURL(file);
      // once the file loads, make an image obj
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        // once the image obj is ready, clear the canvas and draw the image
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
  },
  /**
   * A function to check if the canvas is blank.
   * @param {canvas} canvas
   * @returns {boolean}
   */
  isCanvasBlank: (canvas) => {
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() === blank.toDataURL();
  },
  /**
   * Saves the current canvas to a file
   * @param {HTMLCanvasElement} canvas
   * @returns {void}
   */
  saveCanvas: (canvas) => {
    // convert the canvas image to data that can be saved
    canvas.toBlob(async (data) => {
      const arrBuff = await data.arrayBuffer();
      const response = await window.saveImage.saveImage("saveImage", arrBuff);
      if (!response) {
        console.log("save dialog was closed");
        return;
      }
      console.log(await response);
    }, "image/png");
  },
};

export default utils;
