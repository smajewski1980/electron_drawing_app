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
   * sets the currently picked color
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
    // early return if the color is already included in the pallette
    if (recentColors.includes(color)) return;
    // if there are less than 5 colors in the pallette,
    // add the color, otherwise get rid of the oldest
    // then add the new
    if (recentColors.length < 5) {
      recentColors.push(color);
    } else {
      recentColors.shift();
      recentColors.push(color);
    }
    // after a change, refresh the color pallette
    colorFuncs.refreshRecentColorsPallette();
  },
  /**
   * this takes the recent colors and applies
   */
  refreshRecentColorsPallette: () => {
    const recentClrDivs = Array.from(
      document.querySelectorAll(".recent-color"),
    );
    // make sure the newest color is on the left side of the pallette
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
