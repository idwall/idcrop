const IdCrop = (function() {
  "use strict";

  let elements = {},
    bg_image = {},
    is_moving = false,
    is_resizing = false,
    displayContainerId = "",
    previewContainerId = "";

  const init = function(display_id, preview_id) {
    displayContainerId = display_id;
    previewContainerId = preview_id;

    // Generate the UI.
    createUI();
    fakeInput(elements.upload, elements.upload_fake);

    // File input by clicking event.
    elements.upload.addEventListener("change", startCropping, false);
    // File input by dragging event.
    const draggables = [].concat(
      Array.from(elements.overlays),
      elements.display,
      elements.crop
    );
    for (const draggable of draggables) {
      // All of this events will not do anything if there isn"t a file.
      draggable.addEventListener("dragenter", dragFileEnter, false);
      draggable.addEventListener("dragover", dragFileOver, false);
      draggable.addEventListener("dragleave", dragFileLeave, false);
      draggable.addEventListener("drop", startCropping, false);
    }
    // Event for moving the crop area.
    elements.crop.addEventListener("mousedown", startMoving, false);
    // Event for resizing the crop area.
    for (const handle of Array.from(elements.handles)) {
      handle.addEventListener("mousedown", startResizing, false);
    }
    // Clear resize and move events.
    window.addEventListener("mouseup", clear, false);
  };

  const createUI = function() {
    /*
         * Injects HTML needed for the UI into the user chosen container.
         *
         * @param string containerId - ID of the chosen outer container.
         */

    let html = "",
      htmlDisplayArea = "";

    // Display Area content

    // Containers for displaying the dragged file.
    const displayArea = document.getElementById(displayContainerId);
    const previewArea = document.getElementById(previewContainerId);

    // Add classes to containers
    displayArea.classList.add("idwall-display");
    previewArea.classList.add("idwall-preview");

    // Overlays for blurring out area outside the cropping area.
    htmlDisplayArea += "<div id='idwall-overlay-top'></div>";
    htmlDisplayArea += "<div id='idwall-overlay-bottom'></div>";
    htmlDisplayArea += "<div id='idwall-overlay-left'></div>";
    htmlDisplayArea += "<div id='idwall-overlay-right'></div>";
    // Actual cropping container.
    htmlDisplayArea += "<div id='idwall-crop'>";
    // Resize handles.
    htmlDisplayArea += "<div id='idwall-resize-nw'></div>";
    htmlDisplayArea += "<div id='idwall-resize-n'></div>";
    htmlDisplayArea += "<div id='idwall-resize-ne'></div>";
    htmlDisplayArea += "<div id='idwall-resize-e'></div>";
    htmlDisplayArea += "<div id='idwall-resize-se'></div>";
    htmlDisplayArea += "<div id='idwall-resize-s'></div>";
    htmlDisplayArea += "<div id='idwall-resize-sw'></div>";
    htmlDisplayArea += "<div id='idwall-resize-w'></div>";
    // End of cropping area.
    htmlDisplayArea += "</div>";
    htmlDisplayArea += "<p>Drop files here or ";
    // Fake button for better style handling of the file input.
    htmlDisplayArea += "<a href='' id='idwall-upload-fake'>browse...</a>";
    htmlDisplayArea += "</p>";

    // End of file display area.
    displayArea.insertAdjacentHTML("beforeend", htmlDisplayArea);

    // File input for convenience.
    html += "<input type='file' name='upload' id='idwall-upload' />";
    html += "<p id='idwall-file-name'>No file selected.</p>";

    // Append to body.
    document.body.insertAdjacentHTML("beforeend", html);
    // Populate elements JSON, now that they exist.
    elements = getElements();
  };

  const getElements = function() {
    /*
         * Generates JSON with all the elements from the injected HTML.
         */

    return {
      // Display area.
      display: document.getElementById(displayContainerId),
      hint: document.querySelector(".idwall-display p"),
      overlays: document.querySelectorAll("[id^=idwall-overlay-]"),
      crop: document.getElementById("idwall-crop"),
      handles: document.querySelectorAll("[id^=idwall-resize-]"),
      // Upload area.
      upload: document.getElementById("idwall-upload"),
      upload_fake: document.getElementById("idwall-upload-fake"),
      filename: document.getElementById("idwall-file-name"),
      // Preview crop area.
      preview: document.getElementById(previewContainerId)
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

  const startCropping = function(event) {
    /*
         * Displays the inputted file and and the cropping UI.
         */
    event = event || window.event;
    event.preventDefault();

    elements.display.classList.remove("hovered");

    if (typeof event.target.files !== "undefined" || checkUploading(event)) {
      // Get the file object and start the reader.
      const file =
          typeof event.target.files === "undefined"
            ? event.dataTransfer.files[0]
            : event.target.files[0],
        reader = new FileReader();

      if (typeof file === "undefined") return false;

      displayFilename(file.name);

      // Display the image, hide the label and show cropping area.
      reader.onload = function(event) {
        elements.display.style.backgroundImage =
          "url(" + event.target.result + ")";
        elements.hint.style.display = "none";
        elements.crop.style.display = "block";

        sizeOverlays();
        getBackgroundImageSize();
        previewCropped();
      };

      reader.readAsDataURL(file);
    }
  };

  const displayFilename = function(name) {
    /*
         * Add actual filename to the filename element.
         *
         * @param string name - the name of the file being uploaded.
         */

    elements.filename.innerHTML = name;
  };

  const checkUploading = function() {
    /*
         * Checks if file drag.
         *
         * @return false if no file, true if there is a file.
         */

    if (is_resizing || is_moving) {
      return false;
    } else {
      return true;
    }
  };

  const sizeOverlays = function() {
    /*
         * Resizes the overlay divs based on the position
         * and size of the cropping area.
         */

    const crop = elements.crop;
    const overlays = elements.overlays;
    const crop_offset = crop.offsetParent;

    // 0. overlay-top
    // 1. overlay-bottom
    // 2. overlay-left
    // 3. overlay-right
    for (const overlay of overlays) {
      overlay.style.display = "block";
    }

    const top = crop.offsetTop;
    const bottom =
      crop_offset.offsetHeight - (crop.offsetHeight + crop.offsetTop);
    overlays[0].style.height = top + "px";
    overlays[1].style.height = bottom + "px";

    const middle = crop_offset.offsetHeight - (top + bottom);
    overlays[2].style.height = middle + "px";
    overlays[3].style.height = middle + "px";

    overlays[2].style.top = top + "px";
    overlays[3].style.top = top + "px";

    overlays[2].style.width = crop.offsetLeft + "px";
    overlays[3].style.width =
      crop_offset.offsetWidth - (crop.offsetLeft + crop.offsetWidth) + "px";
  };

  const dragFileEnter = function(event) {
    /*
         * Gives feedback when the file enterd the display area.
         */

    if (checkUploading(event)) {
      elements.display.classList.add("hovered");
    }
  };

  const dragFileLeave = function(event) {
    /*
         * Gives feedback when the file left the display area.
         */

    if (checkUploading(event)) {
      elements.display.classList.remove("hovered");
    }
  };

  const dragFileOver = function(event) {
    /*
         * Make sure the source item if copied when dropped.
         */

    event = event || window.event;

    if (checkUploading(event)) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const startMoving = function(event) {
    /*
         * Gets all starting positions for the moving action and starts it.
         */

    if (!is_resizing) {
      is_moving = true;
      event = event || window.event;

      const crop = elements.crop;

      var mouse_x = event.clientX,
        mouse_y = event.clientY,
        top = crop.offsetTop,
        left = crop.offsetLeft,
        crop_width = crop.offsetWidth,
        crop_height = crop.offsetHeight;

      var diff_x = mouse_x - left,
        diff_y = mouse_y - top;

      document.onmousemove = function(event) {
        event = event || window.event;

        var mouse_x = event.clientX,
          mouse_y = event.clientY;

        var next_x = mouse_x - diff_x,
          next_y = mouse_y - diff_y;

        if (next_x < bg_image.left) next_x = bg_image.left;
        if (next_y < bg_image.top) next_y = bg_image.top;
        if (next_x + crop_width > bg_image.width + bg_image.left)
          next_x = bg_image.width + bg_image.left - crop_width;
        if (next_y + crop_height > bg_image.height + bg_image.top)
          next_y = bg_image.height + bg_image.top - crop_height;

        move(crop, next_x, next_y);
      };
    }
  };

  const move = function(div, next_x, next_y) {
    div.style.left = next_x + "px";
    div.style.top = next_y + "px";
    sizeOverlays();
  };

  const startResizing = function(event) {
    /*
         * Gets all starting positions for the resizing action and starts it.
         */

    is_resizing = true;

    const display = elements.display,
      display_bounds = display.getBoundingClientRect(),
      direction = event.target.id;

    const crop = elements.crop,
      crop_bounds = crop.getBoundingClientRect(),
      crop_border = parseInt(
        getComputedStyle(crop, null).getPropertyValue("border-left-width"),
        10
      );

    const w_boundary = bg_image.left,
      e_boundary = bg_image.left + bg_image.width,
      n_boundary = bg_image.top,
      s_boundary = bg_image.top + bg_image.height;

    const min_width = 100,
      max_width = bg_image.width - crop_border * 2,
      min_height = 100,
      max_height = bg_image.height - crop_border * 2;

    const init_pos_x = event.clientX,
      init_pos_y = event.clientY;

    document.onmousemove = function(event) {
      event = event || window.event;

      let pos_x = event.clientX,
        pos_y = event.clientY;

      let delta_x = init_pos_x - pos_x,
        delta_y = init_pos_y - pos_y;

      let left = clip(
          crop_bounds.left - display_bounds.left - delta_x - crop_border * 2,
          w_boundary,
          e_boundary
        ),
        top = clip(
          crop_bounds.top - display_bounds.top - delta_y - crop_border * 2,
          n_boundary,
          s_boundary
        );

      // The maximum width and height are relative
      // to the position of the crop area.
      let rel_max_width =
          max_width - (crop_bounds.left - display_bounds.left - bg_image.left),
        rel_max_height =
          max_height - (crop_bounds.top - display_bounds.top - bg_image.top);

      let e_width = clip(crop_bounds.width - delta_x, min_width, rel_max_width),
        w_width = clip(crop_bounds.width + delta_x, min_width, max_width),
        s_height = clip(
          crop_bounds.height - delta_y,
          min_height,
          rel_max_height
        ),
        n_height = clip(crop_bounds.height + delta_y, min_height, max_height);

      if (direction == "idwall-resize-e") {
        if (left !== e_boundary) {
          crop.style.width = e_width + "px";
        }
      }
      if (direction == "idwall-resize-s") {
        if (top !== s_boundary) {
          crop.style.height = s_height + "px";
        }
      }
      if (direction == "idwall-resize-w") {
        if (left !== w_boundary) {
          crop.style.width = w_width + "px";
        }
        if (w_width !== rel_max_width && w_width !== min_width) {
          crop.style.left = left + "px";
        }
      }
      if (direction == "idwall-resize-n") {
        if (top !== n_boundary) {
          crop.style.height = n_height + "px";
        }
        if (n_height !== rel_max_height && n_height !== min_height) {
          crop.style.top = top + "px";
        }
      }

      if (direction == "idwall-resize-se") {
        if (top !== s_boundary) {
          crop.style.height = s_height + "px";
        }
        if (left !== e_boundary) {
          crop.style.width = e_width + "px";
        }
      }
      if (direction == "idwall-resize-sw") {
        if (top !== s_boundary) {
          crop.style.height = s_height + "px";
        }
        if (left !== w_boundary) {
          crop.style.width = w_width + "px";
        }
        if (w_width !== rel_max_width && w_width !== min_width) {
          crop.style.left = left + "px";
        }
      }
      if (direction == "idwall-resize-ne") {
        if (top != n_boundary) {
          crop.style.height = n_height + "px";
        }
        if (n_height !== rel_max_height && n_height !== min_height) {
          crop.style.top = top + "px";
        }
        if (left !== e_boundary) {
          crop.style.width = e_width + "px";
        }
      }
      if (direction == "idwall-resize-nw") {
        if (top !== n_boundary) {
          crop.style.height = n_height + "px";
        }
        if (n_height !== rel_max_height && n_height !== min_height) {
          crop.style.top = top + "px";
        }
        if (left !== w_boundary) {
          crop.style.width = w_width + "px";
        }
        if (w_width !== rel_max_width && w_width !== min_width) {
          crop.style.left = left + "px";
        }
      }

      sizeOverlays();
    };
  };

  const clip = function(int, min, max) {
    /*
         * Receives an integer a minimum and a maximum.
         * If the integer in below the min value it returns the min,
         * if it"s above the max it returns the max value and if it"s
         * a value inside the min, max range it returns the int itself.
         */

    if (int < min) {
      return min;
    } else if (int > max) {
      return max;
    } else {
      return int;
    }
  };

  const previewCropped = function() {
    /*
         * Crops and displays image in preview area.
         */

    let cropped = "";

    const crop_bounds = elements.crop.getBoundingClientRect();
    const display_bounds = elements.display.getBoundingClientRect();
    const preview_bounds = elements.preview.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = function() {
      let resize_ratio = image.height / bg_image.height;

      // Get crop area position relative to container.
      let relTop = crop_bounds.top - display_bounds.top;
      let relLeft = crop_bounds.left - display_bounds.left;

      // Get the crop area position relative to the real image.
      let top = (relTop - bg_image.top) * resize_ratio;
      let left = (relLeft - bg_image.left) * resize_ratio;
      // Get width and height of crop relative to real image.
      let width = crop_bounds.width * resize_ratio;
      let height = crop_bounds.height * resize_ratio;

      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, preview_bounds.width, preview_bounds.height);
      context.drawImage(image, left, top, width, height, 0, 0, width, height);

      cropped = canvas.toDataURL();
      elements.preview.style.backgroundImage = "url(" + cropped + ")";
    };

    image.src = bg_image.base64;
  };

  const getBackgroundImageSize = function() {
    /*
         * Returns the size of the background image and the borders around it.
         */

    const base64 = elements.display.style.backgroundImage.slice(5, -2);
    const display_bounds = elements.display.getBoundingClientRect();

    document.createElement("canvas");
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
        bg_width = display_bounds.width;
        bg_height = image.height * display_bounds.width / image.width;
        border_top = (display_bounds.height - bg_height) / 2;
      } else if (orientation === "vertical") {
        // Height of the image will be the same as the container.
        bg_height = display_bounds.height;
        bg_width = image.width * display_bounds.height / image.height;
        border_left = (display_bounds.width - bg_width) / 2;
      }

      bg_image = {
        base64: base64,
        width: bg_width,
        height: bg_height,
        left: border_left,
        top: border_top
      };
    };

    image.src = base64;
  };

  const clear = function() {
    is_moving = false;
    is_resizing = false;
    previewCropped();
    document.onmousemove = function() {};
  };

  return {
    init: init
  };
})();

module.exports = exports = IdCrop;
