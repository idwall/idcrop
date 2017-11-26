const Widget = (function() {
    "use strict";

    let elements = {},
        is_moving = false,
        is_resizing = false,
        displayContainerId,
        previewContainerId,
        cropped = "";

    const init = function (container_id, _displayContainerId, _previewContainerId) {

        displayContainerId = _displayContainerId;
        previewContainerId = _previewContainerId;

        // Generate the UI.
        createUI(container_id);
        fakeInput(elements.upload, elements.upload_fake);

        // File input by clicking event.
        elements.upload.addEventListener("change", startCropping, false);
        // File input by dragging event.
        const draggables = [].concat(Array.from(elements.overlays),
            elements.display, elements.crop);
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
    }

    const createUI = function (container_id) {

        /*
         * Injects HTML needed for the UI into the user chosen container.
         *
         * @param string containerId - ID of the chosen outer container.
         */

        let html = "", htmlDisplayArea = "";
    
        
        // Display Area content
        
        // Containers for displaying the dragged file.
        const displayArea = document.getElementById(displayContainerId);
        const previewArea = document.getElementById(previewContainerId);
        
        // Add classes to containers
        displayArea.classList.add("idwall-display");
        previewArea.classList.add("idwall-preview");

        // Overlays for blurring out area outside the cropping area.
        htmlDisplayArea += "<div id=\"idwall-overlay-top\"></div>";
        htmlDisplayArea += "<div id=\"idwall-overlay-bottom\"></div>";
        htmlDisplayArea += "<div id=\"idwall-overlay-left\"></div>";
        htmlDisplayArea += "<div id=\"idwall-overlay-right\"></div>";
        // Actual cropping container.
        htmlDisplayArea += "<div id=\"idwall-crop\">";
            // Resize handles.
            htmlDisplayArea += "<div id=\"idwall-resize-nw\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-n\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-ne\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-e\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-se\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-s\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-sw\"></div>";
            htmlDisplayArea += "<div id=\"idwall-resize-w\"></div>";

        // End of cropping area.
        htmlDisplayArea += "</div>";
        htmlDisplayArea += "<p>Drop files here</p>";

        // End of file display area.
        displayArea.insertAdjacentHTML('beforeend', htmlDisplayArea);

        // File input for convenience.
        html += "<input type=\"file\" name=\"upload\" id=\"idwall-upload\" />";
        // Fake button for better style handling of the file input.
        html += "<button id=\"idwall-upload-fake\" />Browse...</button>";
        html += "<p id=\"idwall-file-name\">No file selected.</p>";

        // Append to body.
        document.body.insertAdjacentHTML( 'beforeend', html);
        // Populate elements JSON, now that they exist.
        elements = getElements(container_id);
    }

    const getElements = function (container_id) {

        /*
         * Generates JSON with all the elements from the injected HTML.
         *
         * @param string containerId - ID of the chosen outer container.
         */

        return {
            container: document.getElementById(container_id),
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
        }
    }

    const fakeInput = function (input, fake_input) {

        /*
         * Gets a fake input to answer as if it were the real one.
         *
         * @param Node input - the input to be hidden and faked.
         * @param Node fake_input - the input that will simulate the hidden one.
         */

        input.style.display = "none";
        fake_input.addEventListener("click", () => input.click());
    }

    const startCropping = function (event) {

        /*
         * Displays the inputted file and and the cropping UI.
         */
        event = event || window.event;
        event.preventDefault();

        elements.display.classList.remove("hovered");

        if (typeof event.target.files !== "undefined" || checkForFile(event)) {
            // Get the file object and start the reader.
            const file = typeof event.target.files === "undefined" ?
                       event.dataTransfer.files[0] :
                       event.target.files[0],
                  reader = new FileReader();

            displayFilename(file.name);

            // Display the image, hide the label and show cropping area.
            reader.onload = function (event) {
                elements.display.style.backgroundImage =
                    "url(" + event.target.result + ")";
                elements.hint.style.display = "none";
                elements.crop.style.display = "block";
                sizeOverlays();
                previewCropped();
            }

            reader.readAsDataURL(file);

        }

    }

    const displayFilename = function (name) {

        /*
         * Add actual filename to the filename element.
         *
         * @param string name - the name of the file being uploaded.
         */

        elements.filename.innerHTML = name;
    }

    const checkForFile = function (event) {

        /*
         * Checks if a file is being dragged over the window.
         *
         * @return false if no file, true if there is a file.
         */

        event = event || window.event;
        return typeof event.dataTransfer !== "undefined" ? true : false;
    }

    const sizeOverlays = function () {

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
        const bottom = (crop_offset.offsetHeight -
            (crop.offsetHeight + crop.offsetTop + 4))
        overlays[0].style.height = top + "px";
        overlays[1].style.height = bottom + "px";

        const middle = crop_offset.offsetHeight - (top + bottom + 4);
        overlays[2].style.height = middle + "px";
        overlays[3].style.height = middle + "px";

        overlays[2].style.top = top + "px";
        overlays[3].style.top = top + "px";

        overlays[2].style.width = crop.offsetLeft + "px";
        overlays[3].style.width = (crop_offset.offsetWidth -
            (crop.offsetLeft + crop.offsetWidth + 4)) + "px";
    }

    const dragFileEnter = function (event) {

        /*
         * Gives feedback when the file enterd the display area.
         */

        if (checkForFile(event)) {
            elements.display.classList.add("hovered");
        }
    }

    const dragFileLeave = function (event) {

        /*
         * Gives feedback when the file left the display area.
         */

        if (checkForFile(event)) {
            elements.display.classList.remove("hovered");
        }
    }

    const dragFileOver = function (event) {

        /*
         * Make sure the source item if copied when dropped.
         */

        event = event || window.event;

        if (checkForFile(event)) {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        }


    }

    const startMoving = function (event) {

        /*
         * Gets all starting positions for the moving action and starts it.
         */

        if(!is_resizing) {

            is_moving = true;
            event = event || window.event;

            const crop = elements.crop;
            const display = elements.display;

            var mouse_x = event.clientX,
                mouse_y = event.clientY,
                top = crop.offsetTop,
                left = crop.offsetLeft,
                crop_width = crop.offsetWidth,
                crop_height = crop.offsetHeight,
                display_width = display.offsetWidth,
                display_height = display.offsetHeight;

            var diff_x = mouse_x - left,
                diff_y = mouse_y - top;

            document.onmousemove = function(event){
                event = event || window.event;

                var mouse_x = event.clientX,
                    mouse_y = event.clientY;

                var next_x = mouse_x - diff_x,
                    next_y = mouse_y - diff_y;

                if (next_x < 0) next_x = 0;
                if (next_y < 0) next_y = 0;
                if (next_x + crop_width > display_width)
                    next_x = display_width - crop_width;
                if (next_y + crop_height > display_height)
                    next_y = display_height - crop_height;

                move(crop, next_x, next_y);
            }
        }
    }

    const move = function (div, next_x, next_y) {
        div.style.left = next_x + "px";
        div.style.top = next_y + "px";
        sizeOverlays();
    }

    const startResizing = function (event) {

        /*
         * Gets all starting positions for the resizing action and starts it.
         */

        is_resizing = true;

        const direction = event.target.id;
        const container_bounds = elements.container.getBoundingClientRect();
        const crop = elements.crop,
              init_size = crop.getBoundingClientRect();

        const init_pos_x = event.clientX,
              init_post_y = event.clientY;

        document.onmousemove = function(event) {
            event = event || window.event;

            let pos_x = event.clientX,
                pos_y = event.clientY;

            let x = pos_x - init_size.left,
                y = pos_y - init_size.top;

            if (direction == "idwall-resize-e") crop.style.width = x + "px";
            if (direction == "idwall-resize-s") crop.style.height = y + "px";

            if (direction == "idwall-resize-w") {
                const reverse_x = init_pos_x - pos_x  + init_size.width;
                const rel_pos_x = pos_x - container_bounds.left;
                crop.style.width = reverse_x + "px";
                crop.style.left = rel_pos_x + "px";
            }
            if (direction == "idwall-resize-n") {
                const reverse_y = init_post_y - pos_y  + init_size.height;
                const rel_pos_y = pos_y - container_bounds.top;
                crop.style.height = reverse_y + "px";
                crop.style.top = rel_pos_y + "px";
            }

            if (direction == "idwall-resize-nw") {
                const reverse_x = init_pos_x - pos_x  + init_size.width;
                const rel_pos_x = pos_x - container_bounds.left;
                crop.style.width = reverse_x + "px";
                crop.style.left = rel_pos_x + "px";
                const reverse_y = init_post_y - pos_y  + init_size.height;
                const rel_pos_y = pos_y - container_bounds.top;
                crop.style.height = reverse_y + "px";
                crop.style.top = rel_pos_y + "px";
            }
            if (direction == "idwall-resize-ne") {
                crop.style.width = x + "px";
                const reverse_y = init_post_y - pos_y  + init_size.height;
                const rel_pos_y = pos_y - container_bounds.top;
                crop.style.height = reverse_y + "px";
                crop.style.top = rel_pos_y + "px";
            }

            if (direction == "idwall-resize-se") {
                crop.style.width = x + "px";
                crop.style.height = y + "px";
            }
            if (direction == "idwall-resize-sw") {
                const reverse_x = init_pos_x - pos_x  + init_size.width;
                const rel_pos_x = pos_x - container_bounds.left;
                crop.style.width = reverse_x + "px";
                crop.style.left = rel_pos_x + "px";
                crop.style.height = y + "px";
            }

            sizeOverlays();
        }
    }

    const previewCropped = function() {

        /*
         * Crops and displays image in preview area.
         */

        let cropped = "";

        const base64 = elements.display.style.backgroundImage.slice(5, -2);

        const screenshot_bounds = elements.crop.getBoundingClientRect();
        const container_bounds = elements.display.getBoundingClientRect();
        const preview_bounds = elements.preview.getBoundingClientRect();

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const image = new Image();
        image.onload = function() {
            // Check image orientation.
            const orientation = image.width > image.height ? "horizontal" : "vertical";
            // Get background image size.
            let bg_width = 0,
                bg_height = 0,
                border_top = 0,
                border_left = 0;
            if (orientation === "horizontal") {
                // Width of the image will be the same as the container.
                bg_width = container_bounds.width;
                bg_height = (image.height * container_bounds.width) / image.width;
                border_top = (container_bounds.height - bg_height) / 2;
            } else if (orientation === "vertical"){
                // Height of the image will be the same as the container.
                bg_height = container_bounds.height;
                bg_width = (image.width * container_bounds.height) / image.height;
                border_left = (container_bounds.width - bg_width) / 2;
            }
            let resize_ratio = image.height / bg_height;

            // Get crop area position relative to container.
            let relTop = screenshot_bounds.top - container_bounds.top;
            let relLeft = screenshot_bounds.left - container_bounds.left;

            // Get the crop area position relative to the real image.
            let top = (relTop - border_top) * resize_ratio;
            let left = (relLeft - border_left) * resize_ratio;
            // Get width and height of crop relative to real image.
            let width = screenshot_bounds.width * resize_ratio;
            let height = screenshot_bounds.height * resize_ratio;

            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, preview_bounds.width, preview_bounds.height);
            context.drawImage(image, left, top, width, height, 0, 0, width, height);

            cropped = canvas.toDataURL();
            elements.preview.style.backgroundImage = "url(" + cropped + ")";
        }

        image.src = base64;
    }

    const clear = function () {

        previewCropped();
        is_moving = false;
        is_resizing = false;
        document.onmousemove = function (){}
    }

    return {
        init: init
    }

}());

exports.Widget = Widget;