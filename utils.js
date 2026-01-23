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
};

export default utils;
// both stacks, ctx, canvas
