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
