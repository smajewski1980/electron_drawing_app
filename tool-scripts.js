import colorFuncs from "./colors.js";
const toolOptionsWrapper = document.getElementById("options-wrapper");

const toolFuncs = {
  /**
   * Clear the toolOptionWrapper and load it with the brush options,
   * send the new strokewidth back through a cb when the input val changes
   * @param {number} width
   * @param {function} setWidth
   * @param {boolean} isEraser
   * @param {string} brushOpacity
   * @param {function} setBrushOpacity
   */
  loadBrushOptions: (
    width,
    setWidth,
    isEraser,
    brushOpacity = "1",
    setBrushOpacity,
  ) => {
    // reset/empty the html element
    toolOptionsWrapper.innerHTML = "";
    // create outer control group div
    const ctrlGrpDiv = document.createElement("div");
    ctrlGrpDiv.classList.add("control-group");
    // create label for the input and set attributes
    const label = document.createElement("label");
    label.id = "stroke-label";
    label.htmlFor = "stroke";
    label.textContent = isEraser ? "eraser width" : "brush width";
    // create the range input and set attributes
    const input = document.createElement("input");
    input.type = "range";
    input.name = "stroke";
    input.id = "stroke";
    input.min = "2";
    input.max = "16";
    input.step = "2";
    input.value = width;
    // put the label and input in control-group and add to toolOptionsWrapper
    ctrlGrpDiv.appendChild(label);
    ctrlGrpDiv.appendChild(input);
    toolOptionsWrapper.appendChild(ctrlGrpDiv);

    // if tool is not the eraser, load the opacity selector input
    if (!isEraser) {
      // create label for the opacity input and set attributes
      const label2 = document.createElement("label");
      label2.id = "opacity-label";
      label2.htmlFor = "opacity";
      label2.textContent = "opacity";
      // create range input for opacity and set attributes
      const input2 = document.createElement("input");
      input2.type = "range";
      input2.name = "opacity";
      input2.id = "opacity";
      input2.min = ".2";
      input2.max = "1";
      input2.step = ".2";
      input2.value = brushOpacity;
      // create another control-group and add the new elements
      const ctrlGrpDiv2 = document.createElement("div");
      ctrlGrpDiv2.classList.add("control-group");
      ctrlGrpDiv2.appendChild(label2);
      ctrlGrpDiv2.appendChild(input2);
      toolOptionsWrapper.appendChild(ctrlGrpDiv2);
      // add an event listener to the opacity input to handle the input change
      input2.addEventListener("change", (e) => {
        const newOpacity = e.target.value;
        setBrushOpacity(newOpacity);
      });
    }
    // add an event listener to the stroke input to handle the input change
    input.addEventListener("change", (e) => {
      width = e.target.value;
      setWidth(Number(e.target.value));

      // if the eraser tool is active, change the cursor depending on new stroke size
      if (isEraser) {
        if (width <= 4) {
          document.body.className = "";
          document.body.classList.add("eraser-sm");
        } else if (width <= 10) {
          document.body.className = "";
          document.body.classList.add("eraser");
        } else if (width <= 16) {
          document.body.className = "";
          document.body.classList.add("eraser-lg");
        }
      }
    });
  },

  /**
   * Clear the toolOptionWrapper and load it with clone options,
   * send the clone image and clone size back through callbacks
   * @param {ImageData} cloneImage
   * @param {number} cloneSize
   * @param {function} setCloneImage
   * @param {function} setCloneSize
   */
  loadCloneOptions: (cloneImage, cloneSize, setCloneImage, setCloneSize) => {
    // reset/empty the html element
    toolOptionsWrapper.innerHTML = "";
    // create the clone preview canvas
    const canv = document.createElement("canvas");
    canv.width = 30;
    canv.height = 30;
    canv.style.outline = "1px solid limegreen";
    // if there is a current clone image, clear the old and put the new in center of canvas
    if (cloneImage) {
      const ctx2 = canv.getContext("2d");
      ctx2.clearRect(0, 0, 30, 30);
      if (cloneImage.width > 20) {
        ctx2.putImageData(cloneImage, 0, 0);
      } else if (cloneImage.width > 10) {
        ctx2.putImageData(cloneImage, 5, 5);
      } else {
        ctx2.putImageData(cloneImage, 10, 10);
      }
    }
    // create clone preview control-group
    const group = document.createElement("div");
    group.className = "control-group";
    group.id = "clone-group-one";
    // create clone size adj control-group
    const groupSizeAdj = document.createElement("div");
    groupSizeAdj.className = "control-group";
    groupSizeAdj.id = "clone-group-size-adj";
    // create label for the input and set attributes
    const labelSzAdj = document.createElement("label");
    labelSzAdj.htmlFor = "clone-size-adj";
    labelSzAdj.textContent = "clone size";
    // create the range input and set attributes
    const inputSzAdj = document.createElement("input");
    inputSzAdj.type = "range";
    inputSzAdj.name = "clone-size-adj";
    inputSzAdj.id = "clone-size-adj";
    inputSzAdj.min = "10";
    inputSzAdj.max = "30";
    inputSzAdj.step = "10";
    inputSzAdj.value = cloneSize;
    // put the size adj label and input in control-group
    groupSizeAdj.appendChild(labelSzAdj);
    groupSizeAdj.appendChild(inputSzAdj);
    // reate the clear clone img button
    const btn = document.createElement("button");
    btn.textContent = "clear clone image";
    btn.id = "clear-clone-btn";
    // add canvas and btn to clear clone control-group
    group.appendChild(canv);
    group.appendChild(btn);
    // add to toolOptionsWrapper
    toolOptionsWrapper.appendChild(group);
    toolOptionsWrapper.appendChild(groupSizeAdj);
    // set the clone img handler
    btn.addEventListener("click", () => {
      setCloneImage(undefined);
      // clear the preview canvas
      const ctx2 = canv.getContext("2d");
      ctx2.clearRect(0, 0, 30, 30);
      // call this func to refresh the tool options ui
      toolFuncs.loadCloneOptions(
        undefined,
        cloneSize,
        setCloneImage,
        setCloneSize,
      );
    });
    // handle the clone size adj input change
    inputSzAdj.addEventListener("change", (e) => {
      // set the new size here and back in renderer.js
      cloneSize = e.target.value;
      setCloneSize(cloneSize);
      // change the cursor depending on clone size
      switch (cloneSize) {
        case "10":
          document.body.className = "";
          document.body.classList.add("clone-sm");
          break;
        case "20":
          document.body.className = "";
          document.body.classList.add("clone");
          break;
        case "30":
          document.body.className = "";
          document.body.classList.add("clone-lg");
          break;
        default:
          break;
      }
    });
  },

  /**
   * this adds a class to the body, to change the cursor icon
   * to match the tool selected
   * @param {string} tool
   */
  setCursor: (tool) => {
    document.body.className = "";
    if (tool === "colors" || !tool) return;
    document.body.classList.add(tool);
  },
  /**
   * Clear the toolOptionWrapper and load it with color options
   * @param {HTMLCanvasElement} canvas
   */
  loadColorsOptions: (canvas) => {
    // reset/empty the html element
    toolOptionsWrapper.innerHTML = "";
    // create fg color control group div
    const group = document.createElement("div");
    group.className = "control-group";
    // create label for the fg color input
    const labelFg = document.createElement("label");
    labelFg.htmlFor = "color-input";
    labelFg.textContent = "F.G. Color";
    // create the fg color picker input
    const inputFg = document.createElement("input");
    inputFg.type = "color";
    inputFg.name = "color";
    inputFg.id = "color-input";
    inputFg.value = colorFuncs.pickedColor();
    // add label and input to the control-group
    group.appendChild(labelFg);
    group.appendChild(inputFg);
    // create bg color control group div
    const group2 = document.createElement("div");
    group2.className = "control-group";
    // create label for the bg color input
    const labelBg = document.createElement("label");
    labelBg.htmlFor = "bg-color-input";
    labelBg.textContent = "B.G. Color";
    // create the bg color picker input
    const inputBg = document.createElement("input");
    inputBg.type = "color";
    inputBg.name = "color";
    inputBg.id = "bg-color-input";
    inputBg.value = "#202020";
    // add label and input to the control-group
    group2.appendChild(labelBg);
    group2.appendChild(inputBg);
    // create recent colors control group div
    const group3 = document.createElement("div");
    group3.className = "control-group";
    group3.id = "recent-colors-wrapper";
    // create label for the recent colors option
    const recentLabel = document.createElement("p");
    recentLabel.textContent = "recent colors:";
    recentLabel.id = "recent-label";
    /**
     * sets the current picked color to the chosen recent color
     * updates the fg input to match the change
     * @param {Event} e
     */
    function handleRecentColor(e) {
      if (e.target.dataset.color != "undefined") {
        colorFuncs.setPickedColor(e.target.dataset.color);
        inputFg.value = e.target.dataset.color;
      }
    }
    /**
     * returns a recent colors div
     * @returns {HTMLDivElement}
     */
    function createRecentColorDiv() {
      const newDiv = document.createElement("div");
      newDiv.className = "recent-color";
      newDiv.addEventListener("click", handleRecentColor);
      return newDiv;
    }
    // create the recent color divs
    const recent1 = createRecentColorDiv();
    const recent2 = createRecentColorDiv();
    const recent3 = createRecentColorDiv();
    const recent4 = createRecentColorDiv();
    const recent5 = createRecentColorDiv();
    // add the label and recent color divs to their control-group
    group3.appendChild(recentLabel);
    group3.appendChild(recent1);
    group3.appendChild(recent2);
    group3.appendChild(recent3);
    group3.appendChild(recent4);
    group3.appendChild(recent5);
    // add the ciontrol-groups to the toolOptionsWrapper
    toolOptionsWrapper.appendChild(group);
    toolOptionsWrapper.appendChild(group2);
    toolOptionsWrapper.appendChild(group3);
    // handle fg color input change
    inputFg.addEventListener("change", (e) => {
      colorFuncs.setPickedColor(e.target.value);
    });
    // handle bg color input change
    inputBg.addEventListener("change", (e) => {
      colorFuncs.handleBgColorChange(e, canvas);
    });
    // after a change refresh the pallette
    colorFuncs.refreshRecentColorsPallette();
  },
};

export default toolFuncs;
