"use strict";

class BgImage {
  constructor(img, container) {
    this.container = container;
    this.img = img;
  }

  get realWidth() {
    return this.img.width;
  }

  get realHeight() {
    return this.img.height;
  }

  get left() {
    return this.calcDimensions().left;
  }

  get top() {
    return this.calcDimensions().top;
  }

  get width() {
    return this.calcDimensions().width;
  }

  get height() {
    return this.calcDimensions().height;
  }

  get ratio() {
    return this.realHeight / this.height;
  }

  calcDimensions() {
    const bounds = this.container.getBoundingClientRect();

    // Possible resized width and height.
    const height = this.realHeight * bounds.width / this.realWidth,
      width = this.realWidth * bounds.height / this.realHeight;

    if (height <= bounds.height) {
      return {
        width: bounds.width,
        height: height,
        top: (bounds.height - height) / 2,
        left: 0
      };
    } else {
      return {
        height: bounds.height,
        width: width,
        top: 0,
        left: (bounds.width - width) / 2
      };
    }
  }
}

module.exports = exports = BgImage;
