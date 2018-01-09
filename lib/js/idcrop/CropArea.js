"use strict";

const BgImage = require("./BgImage.js");
const Polygon = require("./Polygon.js");
const Point = require("./Point.js");

const helpers = require("./helpers.js");

class CropArea {
  constructor(container, base64) {
    this.container = container;
    this.base64 = base64;

    this.canvas = document.createElement("canvas");
    this.isDrawing = false;
    this.img = "";
  }

  clearCanvas() {
    this.isDrawing = true;

    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  create() {
    this.clearCanvas();

    this.container.innerHTML = "";
    this.container.style.backgroundImage = "url(" + this.base64 + ")";
    this.container.appendChild(this.canvas);

    let that = this;
    return helpers.loadImage(this.base64).then(function(img) {
      that.img = new BgImage(img, that.container);
      that.canvas.width = that.img.width;
      that.canvas.height = that.img.height;
      that.canvas.style.left = that.img.left + "px";
      that.canvas.style.top = that.img.top + "px";
      return that.img;
    });
  }

  crop(img, preview, points, config) {
    const auxCanvas = document.createElement("canvas");

    auxCanvas.width = this.img.realWidth;
    auxCanvas.height = this.img.realHeight;

    let realPoints = [];
    for (const point of points) {
      realPoints.push(
        new Point(point.x * this.img.ratio, point.y * this.img.ratio)
      );
    }

    const renderer = new Polygon(preview, auxCanvas);
    renderer.drawWithOverlay(
      realPoints,
      config.overlayColor,
      config.stroke,
      config.strokeColor,
      config.strokeDashed,
      config.fillColor,
      config.showImage ? img : config.showImage
    );

    return auxCanvas.toDataURL();
  }
}

module.exports = exports = CropArea;
