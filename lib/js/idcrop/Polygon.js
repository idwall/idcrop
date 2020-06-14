"use strict";

const Point = require("./Point.js");

class Polygon {
  constructor(container, canvas) {
    this.container = container;
    this.canvas = canvas;
  }

  drawWithOverlay(
    points,
    overlayColor,
    stroke,
    strokeColor,
    strokeDashed,
    strokeWeight,
    fillColor = "",
    img = ""
  ) {
    const context = this.canvas.getContext("2d");
    // Save context for clipping and clear canvas.
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.save();
    // Draw overlay
    context.fillStyle = overlayColor;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.restore();
    // Draw quadrilateral.
    context.save();
    if (strokeDashed) context.setLineDash([5, 3]);
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWeight;
    this.draw(context, points);
    // Create a "hole" on the overlay inside the quadrilateral.
    context.clip();
    if (!img && !fillColor) {
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (!img && fillColor) {
      context.fillStyle = fillColor;
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }
    // Add stroke outside the cleared area.
    if (stroke) context.stroke();
    // Remove clipping mask.
    context.restore();
  }

  draw(context, points) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    let coordinates = [];
    for (const point of points.slice(1)) {
      context.lineTo(point.x, point.y);
      coordinates.push([point.x, point.y]);
    }
    context.closePath();
  }

  startResizing(event, points, config) {
    if (!this.isDrawing && event.target.className === "idwall-handle") {
      const handle = event.target;
      const hdim = handle.offsetWidth;
      const direction = parseInt(handle.id.substr(10), 10);
      const bounds = this.canvas.getBoundingClientRect();
      console.log(event, points, config)
      let that = this;
      document.onmousemove = function(event) {
        let x = event.clientX;
        let y = event.clientY;

        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right - hdim) x = bounds.right - hdim;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom - hdim) y = bounds.bottom - hdim;

        that.resize(handle, direction, points, x, y, config);
      };

      document.ontouchmove = function(event) {
        let x = event.changedTouches[0].clientX;
        let y = event.changedTouches[0].clientY;

        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right - hdim) x = bounds.right - hdim;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom - hdim) y = bounds.bottom - hdim;

        that.resize(handle, direction, points, x, y, config);
      };
    }
  }

  resize(target, direction, points, x, y, config) {
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
    this.drawWithOverlay(
      points,
      config.overlayColor,
      config.stroke,
      config.strokeColor,
      config.strokeDashed,
      config.strokeWeight
    );

    var resized = new CustomEvent("resized", { detail: [canvasX, canvasY] });
    document.dispatchEvent(resized);
  }
}

module.exports = exports = Polygon;
