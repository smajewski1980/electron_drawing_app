import colorFuncs from "./colors.js";
import utils from "./utils.js";
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
    toolOptionsWrapper.innerHTML = "";

    const ctrlGrpDiv = document.createElement("div");
    ctrlGrpDiv.classList.add("control-group");

    const label = document.createElement("label");
    label.id = "stroke-label";
    label.htmlFor = "stroke";
    label.textContent = isEraser ? "eraser width" : "brush width";

    const input = document.createElement("input");
    input.type = "range";
    input.name = "stroke";
    input.id = "stroke";
    input.min = "2";
    input.max = "16";
    input.step = "2";
    input.value = width;

    ctrlGrpDiv.appendChild(label);
    ctrlGrpDiv.appendChild(input);
    toolOptionsWrapper.appendChild(ctrlGrpDiv);

    // if tool is not the eraser, load the opacity selector input
    if (!isEraser) {
      const label2 = document.createElement("label");
      label2.id = "opacity-label";
      label2.htmlFor = "opacity";
      label2.textContent = "opacity";

      const input2 = document.createElement("input");
      input2.type = "range";
      input2.name = "opacity";
      input2.id = "opacity";
      input2.min = ".2";
      input2.max = "1";
      input2.step = ".2";
      input2.value = brushOpacity;

      const ctrlGrpDiv2 = document.createElement("div");
      ctrlGrpDiv2.classList.add("control-group");
      ctrlGrpDiv2.appendChild(label2);
      ctrlGrpDiv2.appendChild(input2);
      toolOptionsWrapper.appendChild(ctrlGrpDiv2);

      input2.addEventListener("change", (e) => {
        const newOpacity = e.target.value;
        setBrushOpacity(newOpacity);
      });
    }

    input.addEventListener("change", (e) => {
      width = e.target.value;
      setWidth(Number(e.target.value));

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
    toolOptionsWrapper.innerHTML = "";

    const canv = document.createElement("canvas");
    canv.width = 30;
    canv.height = 30;
    canv.style.outline = "1px solid limegreen";

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

    const group = document.createElement("div");
    group.className = "control-group";
    group.id = "clone-group-one";

    const groupSizeAdj = document.createElement("div");
    groupSizeAdj.className = "control-group";
    groupSizeAdj.id = "clone-group-size-adj";

    const labelSzAdj = document.createElement("label");
    labelSzAdj.htmlFor = "clone-size-adj";
    labelSzAdj.textContent = "clone size";

    const inputSzAdj = document.createElement("input");
    inputSzAdj.type = "range";
    inputSzAdj.name = "clone-size-adj";
    inputSzAdj.id = "clone-size-adj";
    inputSzAdj.min = "10";
    inputSzAdj.max = "30";
    inputSzAdj.step = "10";
    inputSzAdj.value = cloneSize;

    groupSizeAdj.appendChild(labelSzAdj);
    groupSizeAdj.appendChild(inputSzAdj);

    const btn = document.createElement("button");
    btn.textContent = "clear clone image";
    btn.id = "clear-clone-btn";
    group.appendChild(canv);
    group.appendChild(btn);
    toolOptionsWrapper.appendChild(group);
    toolOptionsWrapper.appendChild(groupSizeAdj);

    btn.addEventListener("click", () => {
      setCloneImage(undefined);

      const ctx2 = canv.getContext("2d");
      ctx2.clearRect(0, 0, 30, 30);

      toolFuncs.loadCloneOptions(
        undefined,
        cloneSize,
        setCloneImage,
        setCloneSize,
      );
    });

    inputSzAdj.addEventListener("change", (e) => {
      cloneSize = e.target.value;
      setCloneSize(cloneSize);
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
    toolOptionsWrapper.innerHTML = "";

    const group = document.createElement("div");
    group.className = "control-group";

    const labelFg = document.createElement("label");
    labelFg.htmlFor = "color-input";
    labelFg.textContent = "F.G. Color";

    const inputFg = document.createElement("input");
    inputFg.type = "color";
    inputFg.name = "color";
    inputFg.id = "color-input";
    inputFg.value = colorFuncs.pickedColor();

    group.appendChild(labelFg);
    group.appendChild(inputFg);

    const group2 = document.createElement("div");
    group2.className = "control-group";

    const labelBg = document.createElement("label");
    labelBg.htmlFor = "bg-color-input";
    labelBg.textContent = "B.G. Color";

    const inputBg = document.createElement("input");
    inputBg.type = "color";
    inputBg.name = "color";
    inputBg.id = "bg-color-input";
    inputBg.value = "#202020";

    group2.appendChild(labelBg);
    group2.appendChild(inputBg);

    toolOptionsWrapper.appendChild(group);
    toolOptionsWrapper.appendChild(group2);

    inputFg.addEventListener("change", (e) => {
      colorFuncs.setPickedColor(e.target.value);
    });

    inputBg.addEventListener("change", (e) => {
      utils.handleBgColorChange(e, canvas);
    });
  },
};

export default toolFuncs;
