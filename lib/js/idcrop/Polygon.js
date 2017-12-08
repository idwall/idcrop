"use strict";

const Point = require("./Point.js");

class Polygon {
  constructor(container, canvas) {
    this.container = container;
    this.canvas = canvas;
  }

  drawWithOverlay(points, overlayAlpha, strokeStyle, img = "", fill = "") {
    const context = this.canvas.getContext("2d");
    // Save context for clipping and clear canvas.
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.save();
    // Draw overlay
    context.fillStyle = "rgba(0, 0, 0," + overlayAlpha + ")";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.restore();
    // Draw quadrilateral.
    context.save();
    context.setLineDash([5, 3]);
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    this.draw(context, points);
    // Create a "hole" on the overlay inside the quadrilateral.
    context.clip();
    if (!img && !fill) {
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (!img && fill) {
      context.fillStyle = fill;
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }
    // Add stroke outside the cleared area.
    if (strokeStyle) context.stroke();
    // Remove clipping mask.
    context.restore();
  }

  draw(context, points) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      context.lineTo(point.x, point.y);
    }
    context.closePath();
  }

  startResizing(event, points) {
    if (!this.isDrawing && event.target.className === "handle") {
      const handle = event.target;
      const hdim = handle.offsetWidth;
      const direction = parseInt(handle.id.substr(10), 10);
      const bounds = this.canvas.getBoundingClientRect();

      let that = this;
      document.onmousemove = function(event) {
        let x = event.clientX;
        let y = event.clientY;

        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right - hdim) x = bounds.right - hdim;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom - hdim) y = bounds.bottom - hdim;

        that.resize(handle, direction, points, x, y);
      };
    }
  }

  resize(target, direction, points, x, y) {
    const cbounds = this.canvas.getBoundingClientRect();
    const dbounds = this.container.getBoundingClientRect();
    const hdim = target.offsetWidth;

    const displayX = x - dbounds.left;
    const displayY = y - dbounds.top;
    const canvasX = x - cbounds.left + hdim / 2;
    const canvasY = y - cbounds.top + hdim / 2;

    target.style.left = displayX + "px";
    target.style.top = displayY + "px";

    points[direction] = new Point(canvasX, canvasY);
    this.drawWithOverlay(points, 0.7, true);
  }
}

module.exports = exports = Polygon;
