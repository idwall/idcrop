"use strict";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  findAngle(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;

    return Math.atan2(dx, dy);
  }

  move(xStep, yStep) {
    this.x += xStep;
    this.y += yStep;
  }

  static findCenter(points) {
    let x = 0;
    let y = 0;

    for (const point of points) {
      x += point.x;
      y += point.y;
    }

    return new Point(x / points.length, y / points.length);
  }

  static sort(points) {
    const center = this.findCenter(points);

    return points.sort(function(a, b) {
      const aa = a.findAngle(center);
      const ab = b.findAngle(center);
      return aa > ab;
    });
  }
}

module.exports = exports = Point;
