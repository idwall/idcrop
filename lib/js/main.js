const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop({
  displaySelector: "#display",
  previewSelector: "#preview",
  toolbarSelector: "#toolbar",
  numPoints: Infinity
});

document.addEventListener("created", data => console.log(data.detail));
document.addEventListener("handleCreated", data => console.log(data.detail));
document.addEventListener("resized", data => console.log(data.detail));
document.addEventListener("crop", data => console.log(idcrop.getPoints()));

idcrop.init();