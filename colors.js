const colorInput = document.getElementById("color-input");
let pickedColor = "white";

const colorFuncs = {
  /**
   * this diasables the foreground color picker when called
   */
  disableFgColor: () => {
    const label = colorInput.labels[0];
    label.inert = true;
    label.style.opacity = 0.4;
    colorInput.inert = true;
    colorInput.style.opacity = 0.4;
  },
  /**
   * this reenables the foreground color picker when called
   */
  reenableFgColor: () => {
    const label = colorInput.labels[0];
    colorInput.inert = false;
    label.inert = false;
    colorInput.style.opacity = 1;
    label.style.opacity = 1;
  },
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
};

colorInput.addEventListener("change", (e) => {
  pickedColor = e.target.value;
});

export default colorFuncs;
