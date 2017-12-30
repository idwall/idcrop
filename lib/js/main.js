const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop(
  "#displayContainer",
  "#previewContainer",
  false,
  4
);

idcrop.init();