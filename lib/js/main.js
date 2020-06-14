const IdCrop = require("./idcrop/IdCrop.js");

const idcrop = new IdCrop({
  displaySelector: "#display",
  previewSelector: "#preview", // // toolbarSelector: "#toolbar",
  numPoints: 4, // infinity for "close path" button to appear
  allowUpload: false,
  crop: {
    overlayColor: "black",
    fillColor: "white",
    showImage: true
  },
  croppingArea: {
    strokeWeight: 10
  }
});

idcrop.init();
