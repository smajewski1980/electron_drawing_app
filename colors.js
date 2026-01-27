const colorInput = document.getElementById("color-input");
let pickedColor = "#ffffff";
const recentColors = [];

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
  setPickedColor: (color) => {
    pickedColor = color;
    colorFuncs.addToRecentColors(color);
  },
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
    colorFuncs.addToRecentColors(newBgColor);
  },
  /**
   * this adds a color to the recent colors array
   * maintaining a length of 5 in the array
   * @param {string} color
   */
  addToRecentColors: (color) => {
    if (recentColors.includes(color)) return;
    if (recentColors.length < 5) {
      recentColors.push(color);
    } else {
      recentColors.shift();
      recentColors.push(color);
    }
    colorFuncs.refreshRecentColorsPallette();
  },
  /**
   * this takes the recent colors and applies
   */
  refreshRecentColorsPallette: () => {
    const recentClrDivs = Array.from(
      document.querySelectorAll(".recent-color"),
    );

    recentClrDivs.reverse().forEach((el, idx) => {
      el.style.backgroundColor = recentColors[idx];
      el.dataset.color = recentColors[idx];
    });
  },
  /**
   * empties the recentColors array
   */
  clearRecentPallette: () => (recentColors.length = 0),
};

export default colorFuncs;
