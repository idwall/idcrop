const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop(
  "#displayContainer",
  "#previewContainer",
  "#toolbarContainer",
  6
);

idcrop.init();
