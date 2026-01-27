const colorInput = document.getElementById("color-input");
let pickedColor = "#ffffff";

const colorFuncs = {
  /**
   * returns the current picked color
   * @returns {color}
   */
  pickedColor: () => pickedColor,
  /**
   *
   * @param {color} color
   * @returns {void}
   */
  setPickedColor: (color) => (pickedColor = color),
  /**
   *
   * @param {color} color
   * @returns {void}
   */
  setColorInputVal: (color) => (colorInput.value = color),
  /**
   * sets the background color of the canvas
   * @param {Event} e
   * @param {HTMLCanvasElement} canvas
   */
  handleBgColorChange: (e, canvas) => {
    const newBgColor = e.target.value;
    canvas.style.backgroundColor = newBgColor;
  },
};

export default colorFuncs;
