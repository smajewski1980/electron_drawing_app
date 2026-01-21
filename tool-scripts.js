/**
 * Clear the toolOptionWrapper and load it with the brush options,
 * send the new strokewidth back through a cb when the input val changes
 * @param {HTMLElement} toolOptionsWrapper
 * @param {number} strokeWidth
 * @param {function} setStrokeWidth
 */
export function loadBrushOptions(
  toolOptionsWrapper,
  strokeWidth,
  setStrokeWidth,
) {
  toolOptionsWrapper.innerHTML = "";

  const ctrlGrpDiv = document.createElement("div");
  ctrlGrpDiv.classList.add("control-group");

  const label = document.createElement("label");
  label.id = "stroke-label";
  label.htmlFor = "stroke";
  label.textContent = "brush width";

  const input = document.createElement("input");
  input.type = "range";
  input.name = "stroke";
  input.id = "stroke";
  input.min = "2";
  input.max = "16";
  input.step = "2";
  input.value = strokeWidth;

  ctrlGrpDiv.appendChild(label);
  ctrlGrpDiv.appendChild(input);
  toolOptionsWrapper.appendChild(ctrlGrpDiv);

  input.addEventListener("change", (e) => {
    setStrokeWidth(Number(e.target.value));
  });
}

/**
 * Clear the toolOptionWrapper and load it with clone options,
 * send the clone image and clone size back through callbacks
 * @param {HTMLElement} toolOptionsWrapper
 * @param {ImageData} cloneImage
 * @param {number} cloneSize
 * @param {function} setCloneImage
 * @param {function} setCloneSize
 */
export function loadCloneOptions(
  toolOptionsWrapper,
  cloneImage,
  cloneSize,
  setCloneImage,
  setCloneSize,
) {
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
    cloneImage = undefined;
    setCloneImage(cloneImage);
    loadCloneOptions(
      toolOptionsWrapper,
      cloneImage,
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
}

/**
 *
 * @param {string} tool
 */
export function setCursor(tool) {
  document.body.className = "";
  document.body.classList.add(tool);
}
