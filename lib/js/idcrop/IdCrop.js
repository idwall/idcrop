"use strict";

const Point = require("./Point.js");
const Handle = require("./Handle.js");
const Polygon = require("./Polygon.js");
const CropArea = require("./CropArea.js");

const helpers = require("./helpers.js");

class IdCrop {
  constructor(config) {
    this.displayArea = document.querySelector(config.displaySelector);
    this.toolbarArea = config.toolbarSelector
      ? document.querySelector(config.toolbarSelector)
      : "";
    this.previewArea = config.previewSelector
      ? document.querySelector(config.previewSelector)
      : "";

    this.numPoints = config.numPoints ? config.numPoints : 4;

    this.filenameArea = undefined;

    this.cropArea = undefined;
    this.cropPolygon = undefined;
    this.input = undefined;

    this.closeButton = undefined;
    this.handles = [];
    this.points = [];

    this.image = "data:image/jpeg;base64,";
  }

  init() {
    this.displayArea.classList.add("idwall-display");

    if (this.previewArea) this.previewArea.classList.add("idwall-preview");

    if (this.toolbarArea) {
      var hint = document.createElement("p");
      var hintText = document.createTextNode("Drop files here or ");
      var fakeInput = document.createElement("a");
      var fakeInputText = document.createTextNode("Browse...");
      fakeInput.title = "Browse";
      fakeInput.href = "";
      fakeInput.appendChild(fakeInputText);
      hint.appendChild(hintText);
      hint.appendChild(fakeInput);

      this.displayArea.appendChild(hint);
      this.input = document.createElement("input");
      this.input.type = "file";
      this.toolbarArea.appendChild(this.input);
      helpers.fakeInput(this.input, fakeInput);

      this.filenameArea = document.createElement("p");
      this.filenameArea.appendChild(
        document.createTextNode("No file selected.")
      );

      if (this.numPoints === Infinity) {
        this.closeButton = document.createElement("button");
        var closeButtonText = document.createTextNode("Close path");
        this.closeButton.appendChild(closeButtonText);
        this.toolbarArea.appendChild(this.closeButton);
      }

      this.toolbarArea.appendChild(this.filenameArea);
      this.dragDropInput();
    }

    this.createEvents();
  }

  reset() {
    this.cropArea = undefined;
    this.cropPolygon = undefined;
    this.filenameArea = undefined;
    this.closeButton = undefined;
    this.handles = [];
    this.points = [];

    this.image = "data:image/jpeg;base64,";

    if (this.previewArea) this.previewArea.style.backgroundImage = "";

    this.init();
  }

  createEvents() {
    var self = this;

    window.addEventListener("mouseup", function() {
      self.clear(self);
    });

    if (!this.toolbarArea) {
      var src = helpers.getBgSource(self.displayArea);
      helpers.dataURIFromSrc(src).then(function(base64) {
        self.startCroppingArea(base64, self);
      });
    }

    if (this.closeButton) {
      this.closeButton.addEventListener("click", function() {
        self.startCroppingPolygon();
      });
    }
  }

  dragDropInput() {
    var self = this;
    this.input.addEventListener("change", function(event) {
      self.getDroppedFile(event, self);
    });
    this.displayArea.addEventListener("dragenter", function() {
      self.displayArea.classList.add("hovered");
    });
    this.displayArea.addEventListener("dragleave", function() {
      self.displayArea.classList.remove("hovered");
    });
    this.displayArea.addEventListener("dragover", function(event) {
      event = event || window.event;
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
    this.displayArea.addEventListener("drop", function(event) {
      event.preventDefault();
      self.getDroppedFile(event, self);
    });
  }

  getDroppedFile(event, self) {
    event = event || window.event;
    event.preventDefault();
    self.displayArea.classList.remove("hovered");
    var file = event.dataTransfer.files[0];
    var reader = new FileReader();
    if (this.toolbarArea) self.filenameArea.innerHTML = file.name;
    reader.onload = function(event) {
      self.startCroppingArea(event.target.result, self);
    };
    reader.readAsDataURL(file);
  }

  startCroppingArea(base64, self) {
    self.cropArea = new CropArea(self.displayArea, base64);
    self.cropArea.create().then(function(img) {
      self.image = img;
      self.displayArea.style.backgroundImage = "url('" + base64 + "')";
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
          self.displayArea,
          self.image.left,
          self.image.top,
          point
        );

      handle.init();
      self.handles.push(handle);
      self.points.push(point);

      if (self.handles.length == self.numPoints) {
        self.startCroppingPolygon(self);
      }
    }
  }

  startCroppingPolygon(self = this) {
    self.points = Point.sort(self.points);
    self.cropArea.isDrawing = false;

    self.cropPolygon = new Polygon(self.displayArea, self.cropArea.canvas);
    self.cropPolygon.drawWithOverlay(self.points, 0.7, "white");

    for (const handle of self.handles) {
      handle.direction = handle.setDirection(self.points);
      handle.node.addEventListener("mousedown", function(event) {
        self.cropPolygon.startResizing(event, self.points);
      });
    }

    self.drawPreview(self);
  }

  drawPreview(self) {
    const base64 = self.cropArea.crop(
      self.image.img,
      self.previewArea,
      self.points
    );
    self.previewArea.style.backgroundImage = "url('" + base64 + "')";
  }

  clear(self) {
    if (
      typeof self.cropArea !== "undefined" &&
      self.cropArea.isDrawing == false &&
      (self.handles.length == self.numPoints || self.numPoints == Infinity)
    ) {
      if (this.previewArea) self.drawPreview(self);
      document.onmousemove = function() {};
    }
  }
}

module.exports = exports = IdCrop;
