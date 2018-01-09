"use strict";

const Point = require("./Point.js");

/*
 * TODO: Change this class to extend HTMLElement when it's stabilized and
 * available in most browsers. Right now it only works in Chrome.
 * https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements
 */

class Handle {
  constructor(parent, offsetX, offsetY, point) {
    this.parent = parent;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.point = new Point(point.x + offsetX, point.y + offsetY);

    this.node = document.createElement("div");
  }

  init() {
    this.node.className = "handle";
    this.parent.appendChild(this.node);
    this.node.style.left = this.point.x - this.node.offsetWidth / 2 + "px";
    this.node.style.top = this.point.y - this.node.offsetWidth / 2 + "px";
  }

  setDirection(points) {
    for (const [index, point] of points.entries()) {
      if (
        point.x === this.point.x - this.offsetX &&
        point.y === this.point.y - this.offsetY &&
        this.node.id === ""
      ) {
        this.node.id = "direction-" + index;
      }
    }
  }

  delete() {
    this.parent.removeChild(this.node);
    this.node = document.createElement("div");
  }
}

module.exports = exports = Handle;
