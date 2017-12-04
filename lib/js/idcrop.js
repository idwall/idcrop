const IdCrop = (function() {
  "use strict";

  let elements = {},
    bg_image = {},
    is_drawing = false,
    handle_counter = 0,
    points = [],
    s = 4;

  const init = function(displayId, previewId, toolbarId, sides) {
    s = sides;
    // Generate the UI.
    createUI(displayId, previewId, toolbarId);
    fakeInput(elements.upload, elements.upload_fake);
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

    const displayArea = document.getElementById(displayId),
      previewArea = document.getElementById(previewId),
      toolbarArea = document.getElementById(toolbarId);

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
      display: document.getElementById(displayId),
      canvas: document.getElementById("idwall-crop"),
      hint: document.querySelector(".idwall-display p"),
      // Upload area.
      upload: document.getElementById("idwall-upload"),
      upload_fake: document.getElementById("idwall-upload-fake"),
      filename: document.getElementById("idwall-file-name"),
      // Toolbar area.
      toolbar: document.getElementById(toolbarId),
      // Preview crop area.
      preview: document.getElementById(previewId)
    };
  };

  const fakeInput = function(input, fake_input) {
    /*
     * Gets a fake input to answer as if it were the real one.
     *
     * @param Node input - the input to be hidden and faked.
     * @param Node fake_input - the input that will simulate the hidden one.
     */

    input.style.display = "none";
    fake_input.addEventListener("click", function(event) {
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
    handle_counter = 0;

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

      getBackgroundImageSize();
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
    if (is_drawing) {
      const canvas = elements.canvas,
        canvas_bounds = canvas.getBoundingClientRect();
      // Mouse position relative to canvas.
      const x = event.clientX - canvas_bounds.left,
        y = event.clientY - canvas_bounds.top;

      handle_counter += 1;

      points.push([x, y]);

      let handle = document.createElement("div");
      elements.display.appendChild(handle);
      handle.className = "handle";
      handle.style.left = x + bg_image.left - handle.offsetWidth / 2 + "px";
      handle.style.top = y + bg_image.top - handle.offsetWidth / 2 + "px";

      if (handle_counter == s) {
        points = sortPoints(points);
        draw(points);

        // Stop drawing, now it's only resizing.
        is_drawing = false;

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
    is_drawing = true;

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
    context.moveTo(points[0][0], points[0][1]);
    for (const point of points.slice(1)) {
      context.lineTo(point[0], point[1]);
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
          parseInt(point[0] + bg_image.left, 10) === hleft &&
          parseInt(point[1] + bg_image.top, 10) === htop &&
          handle.id === ""
        ) {
          handle.id = "direction-" + index;
        }
      }
      /* eslint-enable */
    }
  };

  const sortPoints = function(points) {
    /*
     * Receives an array with four points and returns it
     * sorted in a clockwise manner.
     */

    const center = findCenter(points);

    return points.sort(function(a, b) {
      const angle_a = findAngle(center, a),
        angle_b = findAngle(center, b);
      return angle_a > angle_b;
    });
  };

  const findCenter = function(points) {
    /*
     * Find the center of an array of points.
     */

    let x = 0,
      y = 0;

    for (const point of points) {
      x += point[0];
      y += point[1];
    }

    return [x / points.length, y / points.length];
  };

  const findAngle = function(center, point) {
    /*
     * Find the angle of the point relative do the center of the polygon.
     */

    const dx = point[0] - center[0],
      dy = point[1] - center[1];

    return Math.atan2(dx, dy);
  };

  const startResizing = function(event) {
    /*
      * Gets all starting positions for the resizing action and starts it.
      */

    if (!is_drawing && event.target.className === "handle") {
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

    points[direction] = [canvasX, canvasY];
    draw(points);
  };

  const previewCropped = function() {
    /*
     * Crops and displays image in preview area.
     */

    if (handle_counter === s) {
      let cropped = "";

      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        image = new Image();

      image.onload = function() {
        canvas.width = image.width;
        canvas.height = image.height;

        let ratio = image.height / bg_image.height,
          realPoints = [];

        for (const point of points) {
          realPoints.push([point[0] * ratio, point[1] * ratio]);
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
        context.moveTo(realPoints[0][0], realPoints[0][1]);
        for (const point of realPoints.slice(1)) {
          context.lineTo(point[0], point[1]);
        }
        context.closePath();
        // Create a "hole" on the overlay inside the polygon.
        context.clip();
        context.drawImage(image, 0, 0, image.width, image.height);
        // Remove clipping mask.
        context.restore();

        cropped = canvas.toDataURL();
        elements.preview.style.backgroundImage = "url(" + cropped + ")";
      };

      image.src = bg_image.base64;
    }
  };

  const getBackgroundImageSize = function() {
    /*
     * Returns the size of the background image and the borders around it.
     */

    const base64 = elements.display.style.backgroundImage.slice(5, -2),
      dbounds = elements.display.getBoundingClientRect();

    const image = new Image();
    image.onload = function() {
      // Check image orientation.
      const orientation =
        image.width > image.height ? "horizontal" : "vertical";
      // Get background image size.
      let bg_width = 0,
        bg_height = 0,
        border_top = 0,
        border_left = 0;
      if (orientation === "horizontal") {
        // Width of the image will be the same as the container.
        bg_width = dbounds.width;
        bg_height = image.height * dbounds.width / image.width;
        border_top = (dbounds.height - bg_height) / 2;
      } else if (orientation === "vertical") {
        // Height of the image will be the same as the container.
        bg_height = dbounds.height;
        bg_width = image.width * dbounds.height / image.height;
        border_left = (dbounds.width - bg_width) / 2;
      }

      bg_image = {
        base64: base64,
        width: bg_width,
        height: bg_height,
        left: border_left,
        top: border_top
      };

      // Set cropping area dimensions relative to bg image.
      elements.canvas.width = bg_image.width;
      elements.canvas.height = bg_image.height;
      elements.canvas.style.left = bg_image.left + "px";
      elements.canvas.style.top = bg_image.top + "px";
    };

    image.src = base64;
  };

  const clear = function() {
    previewCropped();
    document.onmousemove = function() {};
  };

  return {
    init: init
  };
})();

module.exports = exports = IdCrop;
