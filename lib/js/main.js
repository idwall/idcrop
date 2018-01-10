const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop({
  displaySelector: "#display",
  previewSelector: "#preview",
  toolbarSelector: "#toolbar"
});

idcrop.init();