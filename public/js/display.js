const mask = document.querySelector(".mask");
const refreshButton = document.querySelector("a");
const varasija_erotus = document.querySelector(".varasija_erotus");
const paikkojen_erotus = document.querySelector(".paikkojen_erotus");

refreshButton.addEventListener("click", () => {
  mask.classList.remove("hidden");
});

if (varasija_erotus && paikkojen_erotus) {
  let varasija_erotus_value = varasija_erotus.textContent;
  varasija_erotus_value === `(0)`
    ? varasija_erotus.setAttribute("style", "opacity: 0.4")
    : varasija_erotus.setAttribute("style", "color: green");
  let paikkojen_erotus_value = paikkojen_erotus.textContent;
  paikkojen_erotus_value === `(0)`
    ? paikkojen_erotus.setAttribute("style", "opacity: 0.4")
    : paikkojen_erotus.setAttribute("style", "color: red");
}
