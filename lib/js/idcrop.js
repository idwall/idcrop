const Point = require("./Point.js"),
  BgImage = require("./BgImage.js");

const IdCrop = (function() {
  "use strict";

  let elements = {},
    bg = "",
    isDrawing = false,
    handles = 0,
    points = [],
    s = 4;

  const init = function(displayId, previewId, toolbarId, sides) {
    s = sides;
    // Generate the UI.
    createUI(displayId, previewId, toolbarId);
    fakeInput(elements.upload, elements.fakeUpload);
    // File input by clicking event.
    elements.upload.addEventListener("change", startCroppingArea, false);
    // File input by dragging event.
    const draggables = [elements.display, elements.canvas];
    for (const draggable of draggables) {
      draggable.addEventListener("dragenter", dragFileEnter, false);
      draggable.addEventListener("dragover", dragFileOver, false);
      draggable.addEventListener("dragleave", dragFileLeave, false);
      draggable.addEventListener("drop", startCroppingArea, false);
    }
    // Clear events.
    window.addEventListener("mouseup", clear, false);
  };

  const createUI = function(displayId, previewId, toolbarId) {
    /*
     * Injects HTML needed for the UI into the user chosen containers.
     */

    const displayArea = document.querySelector(displayId),
      previewArea = document.querySelector(previewId),
      toolbarArea = document.querySelector(toolbarId);

    // Add classes to containers
    displayArea.classList.add("idwall-display");
    previewArea.classList.add("idwall-preview");

    let htmlDisplay = "",
      htmlToolbar = "";

    // Actual cropping container.
    htmlDisplay += "<canvas id='idwall-crop'></canvas>";
    htmlDisplay += "<p>Drop files here or ";
    // Fake button for better style handling of the file input.
    htmlDisplay += "<a href='' id='idwall-upload-fake'>browse...</a>";
    htmlDisplay += "</p>";
    // File input for convenience.
    htmlToolbar += "<input type='file' name='upload' id='idwall-upload' />";
    htmlToolbar += "<p id='idwall-file-name'>No file selected.</p>";

    toolbarArea.insertAdjacentHTML("beforeend", htmlToolbar);
    displayArea.insertAdjacentHTML("beforeend", htmlDisplay);

    // Populate elements JSON, now that they exist.
    elements = getElements(displayId, previewId, toolbarId);
  };

  const getElements = function(displayId, previewId, toolbarId) {
    /*
     * Generates JSON with all the elements from the injected HTML.
     */

    return {
      // Display area.
      display: document.querySelector(displayId),
      canvas: document.getElementById("idwall-crop"),
      hint: document.querySelector(".idwall-display p"),
      // Upload area.
      upload: document.getElementById("idwall-upload"),
      fakeUpload: document.getElementById("idwall-upload-fake"),
      filename: document.getElementById("idwall-file-name"),
      // Toolbar area.
      toolbar: document.querySelector(toolbarId),
      // Preview crop area.
      preview: document.querySelector(previewId)
    };
  };

  const fakeInput = function(input, fakeInput) {
    /*
     * Gets a fake input to answer as if it were the real one.
     *
     * @param Node input - the input to be hidden and faked.
     * @param Node fakeInput - the input that will simulate the hidden one.
     */

    input.style.display = "none";
    fakeInput.addEventListener("click", function(event) {
      event = event || window.event;
      event.preventDefault();
      input.click();
    });
  };

  const startCroppingArea = function(event) {
    /*
     * Displays the inputted file and starts the cropping UI.
     */

    event = event || window.event;
    event.preventDefault();

    elements.display.classList.remove("hovered");
    handles = 0;

    // Get the file object and start the reader.
    const file =
        typeof event.target.files === "undefined"
          ? event.dataTransfer.files[0]
          : event.target.files[0],
      reader = new FileReader();

    if (typeof file === "undefined") return false;

    elements.filename.innerHTML = file.name;

    // Display the image, hide the label and start listening to click on canvas.
    reader.onload = function(event) {
      elements.display.style.backgroundImage =
        "url(" + event.target.result + ")";
      elements.hint.style.display = "none";
      elements.canvas.style.display = "block";

      loadImage(event.target.result).then(function(img) {
        bg = new BgImage(img, elements.display);
        elements.canvas.width = bg.width;
        elements.canvas.height = bg.height;
        elements.canvas.style.left = bg.left + "px";
        elements.canvas.style.top = bg.top + "px";
      });

      clearCanvas();
      elements.canvas.addEventListener("mousedown", createHandles, false);
    };

    reader.readAsDataURL(file);
  };

  const dragFileEnter = function() {
    /*
     * Gives feedback when the file enterd the display area.
     */

    elements.display.classList.add("hovered");
  };

  const dragFileLeave = function() {
    /*
     * Gives feedback when the file left the display area.
     */

    elements.display.classList.remove("hovered");
  };

  const dragFileOver = function(event) {
    /*
     * Make sure the source item if copied when dropped.
     */

    event = event || window.event;
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const createHandles = function(event) {
    if (isDrawing) {
      const canvas = elements.canvas,
        cbounds = canvas.getBoundingClientRect();
      // Mouse position relative to canvas.
      const x = event.clientX - cbounds.left,
        y = event.clientY - cbounds.top;

      handles += 1;

      points.push(new Point(x, y));

      let handle = document.createElement("div");
      elements.display.appendChild(handle);
      handle.className = "handle";
      handle.style.left = x + bg.left - handle.offsetWidth / 2 + "px";
      handle.style.top = y + bg.top - handle.offsetWidth / 2 + "px";

      if (handles == s) {
        points = Point.sort(points);
        draw(points);

        // Stop drawing, now it's only resizing.
        isDrawing = false;

        const handles = document.querySelectorAll(".handle");
        labelHandles(points, handles);
        for (handle of handles) {
          document.addEventListener("mousedown", startResizing);
        }
      }
    }
  };

  const clearCanvas = function() {
    const canvas = elements.canvas,
      context = canvas.getContext("2d");

    points = [];
    isDrawing = true;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    const handles = document.querySelectorAll(".handle");
    for (const handle of handles) {
      elements.display.removeChild(handle);
    }
  };

  const draw = function(points) {
    /*
     * Draws a shape based on a series of points and the overlay around it.
     */

    const canvas = elements.canvas;
    const context = canvas.getContext("2d");
    // Save context for clipping and clear canvas.
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    // Draw overlay
    context.fillStyle = "rgba(0, 0, 0, .7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    // Draw quadrilateral.
    context.save();
    context.setLineDash([5, 3]);
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    // Create a "hole" on the overlay inside the quadrilateral.
    context.clip();
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Add stroke outside the cleared area.
    context.stroke();
    // Remove clipping mask.
    context.restore();
  };

  const labelHandles = function(points, handles) {
    /*
     * Adds ids to the handles after the sorted points.
     *
     * !IMPORTANT! The point is relative to the canvas,
     * and the handle is relative to the display area.
     */

    for (const handle of handles) {
      const hleft = parseInt(handle.style.left, 10) + handle.offsetWidth / 2,
        htop = parseInt(handle.style.top, 10) + handle.offsetWidth / 2;
      /* eslint-disable */
      for ([index, point] of points.entries()) {
        if (
          parseInt(point.x + bg.left, 10) === hleft &&
          parseInt(point.y + bg.top, 10) === htop &&
          handle.id === ""
        ) {
          handle.id = "direction-" + index;
        }
      }
      /* eslint-enable */
    }
  };

  const startResizing = function(event) {
    /*
      * Gets all starting positions for the resizing action and starts it.
      */

    if (!isDrawing && event.target.className === "handle") {
      const handle = event.target,
        hdim = handle.offsetWidth,
        direction = parseInt(handle.id.substr(10), 10),
        bounds = elements.canvas.getBoundingClientRect();

      document.onmousemove = function(event) {
        let x = event.clientX,
          y = event.clientY;

        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right - hdim) x = bounds.right - hdim;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom - hdim) y = bounds.bottom - hdim;

        resize(handle, direction, x, y);
      };
    }
  };

  const resize = function(target, direction, x, y) {
    const cbounds = elements.canvas.getBoundingClientRect(),
      dbounds = elements.display.getBoundingClientRect(),
      hdim = target.offsetWidth;

    const displayX = x - dbounds.left,
      displayY = y - dbounds.top,
      canvasX = x - cbounds.left + hdim / 2,
      canvasY = y - cbounds.top + hdim / 2;

    target.style.left = displayX + "px";
    target.style.top = displayY + "px";

    points[direction] = new Point(canvasX, canvasY);
    draw(points);
  };

  const crop = function() {
    /*
     * Returns a promise with the base64 of the cropped area if all goes well.
     */

    if (handles === s) {
      let cropped = "";

      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");

      canvas.width = bg.realWidth;
      canvas.height = bg.realHeight;

      let realPoints = [];

      for (const point of points) {
        realPoints.push(new Point(point.x * bg.ratio, point.y * bg.ratio));
      }

      // Save context for clipping and clear canvas.
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      // Draw overlay
      context.fillStyle = "rgba(0, 0, 0, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
      // Draw polygon.
      context.save();
      context.beginPath();
      context.moveTo(realPoints[0].x, realPoints[0].y);
      for (const point of realPoints.slice(1)) {
        context.lineTo(point.x, point.y);
      }
      context.closePath();
      // Create a "hole" on the overlay inside the polygon.
      context.clip();
      context.drawImage(bg.img, 0, 0, canvas.width, canvas.height);
      // Remove clipping mask.
      context.restore();

      cropped = canvas.toDataURL();

      elements.preview.style.backgroundImage = "url(" + cropped + ")";
    } else {
      Error("Not enough handles.");
    }
  };

  const clear = function() {
    crop();
    document.onmousemove = function() {};
  };

  /* UTILITIES */

  const loadImage = function(base64) {
    const img = new Image();

    img.src = base64;

    return new Promise(function(resolve, reject) {
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function() {
        reject(undefined);
      };
    });
  };

  return {
    init: init
  };
})();

module.exports = exports = IdCrop;
