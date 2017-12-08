"use strict";

const Point = require("./Point.js");
const Handle = require("./Handle.js");
const Polygon = require("./Polygon.js");
const CropArea = require("./CropArea.js");

const helpers = require("./helpers.js");

class IdCrop {
  constructor(displayId, previewId, toolbarId, sides) {
    /* eslint-disable */
    this.displayArea = document.querySelector(displayId);
    this.toolbarArea = document.querySelector(toolbarId);
    /* eslint-disable */
    this.previewArea = document.querySelector(previewId);

    this.cropArea = undefined;
    this.cropPolygon = undefined;

    this.input = undefined;
    this.filenameArea = undefined;

    this.handles = [];
    this.points = [];

    this.image = "data:image/jpeg;base64,";
    this.numSides = sides;
  }

  init() {
    this.displayArea.classList.add("idwall-display");
    this.previewArea.classList.add("idwall-preview");

    let htmlDisplay = "";
    let htmlToolbar = "";

    const hint = document.createElement("p");
    const hintText = document.createTextNode("Drop files here or ");
    const fakeInput = document.createElement("a");
    const fakeInputText = document.createTextNode("Browse...");
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
    this.filenameArea.appendChild(document.createTextNode("No file selected."));
    if (this.numSides === Infinity) {
      const closeButton = document.createElement("a");
      const closeButtonText = document.createTextNode("Close path")
      closeButton.title = "Close path";
      closeButton.href = "";
      closeButton.appendChild(closeButtonText);
      this.toolbarArea.appendChild(closeButton);

    }
    this.toolbarArea.appendChild(this.filenameArea);

    this.dragDropInput();
    this.createEvents();
  }

  createEvents() {
    const self = this;
    this.input.addEventListener("change", function(event) {
      self.startCroppingArea(event, self);
    });
    window.addEventListener("mouseup", function() {
      self.clear(self);
    });
  }

  dragDropInput() {
    const self = this;
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
      self.startCroppingArea(event, self);
    });
  }

  startCroppingArea(event, self) {
    event = event || window.event;
    event.preventDefault();

    self.displayArea.classList.remove("hovered");

    const file =
      typeof event.target.files === "undefined"
        ? event.dataTransfer.files[0]
        : event.target.files[0];
    const reader = new FileReader();

    self.filenameArea.innerHTML = file.name;

    reader.onload = function(event) {
      // Start new  crop area.
      const base64 = event.target.result;
      self.cropArea = new CropArea(self.displayArea, base64);
      self.cropArea.create().then(function(img) {
        self.image = img;
        self.displayArea.style.backgroundImage = "url('" + base64 + "')";
      });

      // Clear all handles.
      for (const handle of self.handles) {
        handle.deleteNode();
      }
      self.handles = [];

      // Add event listener to create new handles.
      self.cropArea.canvas.addEventListener("mousedown", function(event) {
        self.createHandles(event, self);
      });
    };

    reader.readAsDataURL(file);
  }

  createHandles(event, self) {
    if (self.cropArea.isDrawing) {
      const canvas = self.cropArea.canvas,
        cbounds = canvas.getBoundingClientRect();
      // Mouse position relative to canvas.
      const x = event.clientX - cbounds.left,
        y = event.clientY - cbounds.top;

      let point = new Point(x, y),
        handle = new Handle(
          self.displayArea,
          self.image.left,
          self.image.top,
          point
        );

      handle.create();
      self.handles.push(handle);
      self.points.push(point);

      if (self.handles.length == self.numSides) {
        self.points = Point.sort(self.points);
        self.polygon = new Polygon(self.displayArea, canvas);
        self.polygon.drawWithOverlay(self.points, 0.7, "white");

        for (handle of self.handles) {
          handle.direction = handle.setDirection(self.points);
          handle.node.addEventListener("mousedown", function(event) {
            self.polygon.startResizing(event, self.points);
          });
        }
      }
    }
  }

  clear(self) {
    if (
      typeof self.cropArea !== "undefined" &&
      self.handles.length == self.numSides
    ) {
      const base64 = self.cropArea.crop(self.previewArea, self.points);
      self.previewArea.style.backgroundImage = "url('" + base64 + "')";
      document.onmousemove = function() {};
    }
  }
}

module.exports = exports = IdCrop;
