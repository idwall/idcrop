const IdCrop = require("idcrop");

const idcrop = new IdCrop({
  displaySelector: "#display",
  toolbarSelector: "#toolbar",
  previewSelector: "#preview"
});

idcrop.init();