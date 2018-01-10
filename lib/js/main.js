const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop({
  displaySelector: "#display",
  previewSelector: "#preview",
  toolbarSelector: "#toolbar",
  numPoints: Infinity,
  allowUpload: false
});

idcrop.init();
