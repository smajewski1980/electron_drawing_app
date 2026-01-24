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
    if (undoStack.length === 0) return;
    if (undoStack.length > 1) {
      const curr = undoStack.pop();
      redoStack.push(curr);
      const prevUrl = undoStack[undoStack.length - 1];
      const img = new Image();
      img.src = prevUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
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
      const curr = redoStack.pop();
      undoStack.push(curr);
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
};

export default utils;
// both stacks, ctx, canvas
