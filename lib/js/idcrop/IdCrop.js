"use strict";

const Point = require("./Point.js");
const Handle = require("./Handle.js");
const Polygon = require("./Polygon.js");
const CropArea = require("./CropArea.js");

const helpers = require("./helpers.js");

class IdCrop {
  constructor(config) {
    this.config = {
      numPoints: typeof config.numPoints !== "undefined" ? config.numPoints : 4,
      allowUpload:
        typeof config.allowUpload !== "undefined" ? config.allowUpload : true,
      closeButtonSelector:
        typeof config.closeButtonSelector !== "undefined" 
        ? config.closeButtonSelector 
        : false,
      containers: {
        displayArea: document.querySelector(config.displaySelector),
        toolbarArea: config.toolbarSelector
          ? document.querySelector(config.toolbarSelector)
          : "",
        previewArea: config.previewSelector
          ? document.querySelector(config.previewSelector)
          : ""
      },
      croppingArea: {
        overlayColor:
          typeof config.croppingArea !== "undefined" &&
          typeof config.croppingArea.overlayColor !== "undefined"
            ? config.croppingArea.overlayColor
            : "rgba(0, 0, 0, 0.7)",
        stroke:
          typeof config.croppingArea !== "undefined" &&
          typeof config.croppingArea.stroke !== "undefined"
            ? config.croppingArea.stroke
            : true,
        strokeColor:
          typeof config.croppingArea !== "undefined" &&
          typeof config.croppingArea.strokeColor !== "undefined"
            ? config.croppingArea.strokeColor
            : "white",
        strokeDashed:
          typeof config.croppingArea !== "undefined" &&
          typeof config.croppingArea.strokeDashed !== "undefined"
            ? config.croppingArea.strokeDashed
            : true,
        strokeWeight:
          typeof config.croppingArea !== "undefined" &&
          typeof config.croppingArea.strokeWeight !== "undefined"
            ? config.croppingArea.strokeWeight
            : 2
      },
      crop: {
        overlayColor:
          typeof config.crop !== "undefined" &&
          typeof config.crop.overlayColor !== "undefined"
            ? config.crop.overlayColor
            : "rgba(0, 0, 0, 0)",
        fillColor:
          typeof config.crop !== "undefined" &&
          typeof config.crop.fillColor !== "undefined"
            ? config.crop.fillColor
            : false,
        showImage:
          typeof config.crop !== "undefined" &&
          typeof config.crop.showImage !== "undefined"
            ? config.crop.showImage
            : true,
        stroke:
          typeof config.crop !== "undefined" &&
          typeof config.crop.stroke !== "undefined"
            ? config.crop.stroke
            : true,
        strokeColor:
          typeof config.crop !== "undefined" &&
          typeof config.crop.strokeColor !== "undefined"
            ? config.crop.strokeColor
            : false,
        strokeDashed:
          typeof config.crop !== "undefined" &&
          typeof config.crop.strokeDashed !== "undefined"
            ? config.crop.strokeDashed
            : false,
        strokeWeight:
          typeof config.crop !== "undefined" &&
          typeof config.crop.strokeWeight !== "undefined"
            ? config.crop.strokeWeight
            : 0
      },
      handles: {
        class:
          typeof config.handles !== "undefined" &&
          typeof config.handles.class !== "undefined"
            ? config.handles.class
            : "",
        defaultStyles:
          typeof config.handles !== "undefined" &&
          typeof config.handles.defaultStyles !== "undefined"
            ? config.handles.defaultStyles
            : true
      }
    };

    this.handles = [];
    this.points = [];
  }

  init() {
    const self = this;
    const c = this.config.containers;

    c.displayArea.classList.add("idwall-display");

    if (c.previewArea) c.previewArea.classList.add("idwall-preview");

    if (c.toolbarArea) {
      if (this.config.numPoints === Infinity) {
        var closeButton = "";
        if (this.config.closeButtonSelector) {
          closeButton = document.querySelector(this.config.closeButtonSelector)
        } else {
          closeButton = document.createElement("button");
          var closeButtonText = document.createTextNode("Close path");
          closeButton.appendChild(closeButtonText);
          c.toolbarArea.appendChild(closeButton);
        }
        closeButton.addEventListener("click", function() {
          self.startCroppingPolygon();
        });
      }
    }

    if (c.toolbarArea && this.config.allowUpload) {
      var hint = document.createElement("p");
      var hintText = document.createTextNode("Drop files here or ");
      var fakeInput = document.createElement("a");
      var fakeInputText = document.createTextNode("Browse...");
      fakeInput.title = "Browse";
      fakeInput.href = "";
      fakeInput.appendChild(fakeInputText);
      hint.appendChild(hintText);
      hint.appendChild(fakeInput);
      c.displayArea.appendChild(hint);

      var filenameArea = document.createElement("p");
      filenameArea.appendChild(document.createTextNode("No file selected."));
      c.toolbarArea.appendChild(filenameArea);

      var input = document.createElement("input");
      input.type = "file";
      c.toolbarArea.appendChild(input);
      helpers.fakeInput(input, fakeInput);
      helpers.dragDropInput(input, c.displayArea, filenameArea, this);
    }

    if (!c.toolbarArea || !this.config.allowUpload) {
      var src = helpers.getBgSource(c.displayArea);
      helpers.dataURIFromSrc(src).then(function(base64) {
        self.startCroppingArea(base64, self);
      });
    }

    window.addEventListener("mouseup", function() {
      if (self.config.containers.previewArea) self.drawPreview(self);
      document.onmousemove = function() {};
    });

    var created = new CustomEvent("created", { detail: self.config });
    document.dispatchEvent(created);
  }

  startCroppingArea(base64, self) {
    const displayArea = self.config.containers.displayArea;

    self.cropArea = new CropArea(displayArea, base64);
    self.cropArea.create().then(function(img) {
      self.image = img;
      displayArea.style.backgroundImage = "url('" + base64 + "')";
    });

    for (const handle of self.handles) {
      handle.deleteNode();
    }

    self.handles = [];
    self.cropArea.canvas.addEventListener("mousedown", function(event) {
      self.createHandles(event, self);
    });
  }

  createHandles(event, self) {
    if (self.cropArea.isDrawing) {
      const cbounds = self.cropArea.canvas.getBoundingClientRect();
      const x = event.clientX - cbounds.left,
        y = event.clientY - cbounds.top;

      let point = new Point(x, y),
        handle = new Handle(
          self.config.containers.displayArea,
          self.image.left,
          self.image.top,
          point
        );

      handle.init(self.config.handles.defaultStyles, self.config.handles.class);
      self.handles.push(handle);
      self.points.push(point);

      if (self.handles.length == self.config.numPoints) {
        self.startCroppingPolygon(self);
      }
    }
  }

  startCroppingPolygon(self = this) {
    const c = self.config.croppingArea;

    self.points = Point.sort(self.points);
    self.cropArea.isDrawing = false;

    self.cropPolygon = new Polygon(
      self.config.containers.displayArea,
      self.cropArea.canvas
    );
    self.cropPolygon.drawWithOverlay(
      self.points,
      c.overlayColor,
      c.stroke,
      c.strokeColor,
      c.strokeDashed,
      c.strokeWeight
    );

    for (const handle of self.handles) {
      const config = self.config.croppingArea;
      handle.direction = handle.setDirection(self.points);
      handle.node.addEventListener("mousedown", function(event) {
        self.cropPolygon.startResizing(event, self.points, config);
      });
    }

    self.drawPreview(self);
  }

  drawPreview(self) {
    if (
      self.config.containers.previewArea &&
      typeof this.cropArea !== "undefined" &&
      this.cropArea.isDrawing == false
    ) {
      const base64 = this.cropArea.crop(
        this.image.img,
        this.config.containers.previewArea,
        this.points,
        this.config.crop
      );
      self.config.containers.previewArea.style.backgroundImage =
        "url('" + base64 + "')";
    }
  }

  reset() {
    this.cropArea = undefined;
    this.cropPolygon = undefined;
    
    this.handles = [];
    this.points = [];
    this.image = "data:image/jpeg;base64,";

    if (this.previewArea) this.previewArea.style.backgroundImage = "";

    this.init();
  }

  getPoints() {
    let realPoints = [];
    for (const point of this.points) {
      realPoints.push(
        new Point(point.x * this.image.ratio, point.y * this.image.ratio)
      );
    }
    return realPoints;
  }
}

module.exports = exports = IdCrop;
