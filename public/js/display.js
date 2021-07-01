const mask = document.querySelector(".mask");
const refreshButton = document.querySelector("a");
console.log(`Mask: ${mask}`);
console.log(`Button: ${refreshButton}`);

refreshButton.addEventListener("click", () => {
  mask.classList.remove("hidden");
});
