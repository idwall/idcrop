const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop({
  displaySelector: "#displayContainer",
  previewSelector: "#previewContainer"
});

idcrop.init();
