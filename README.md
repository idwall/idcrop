# IdCrop

Embed for cropping images and returning a base64 of the cropped area.

### Development Environment Setup

```
npm install
npm run server

```

### Usage

```
npm install idcrop
```

###### Javascript

```

const idcrop = require("idcrop");
idcrop.init("toolbarContainer", "displayContainer", "previewContainer");

```

###### HTML

You must create a container for display (cropping area), toolbar (upload button and filename) and preview (cropped area preview)

```
<div id="displayContainer"></div>
<div id="toolbarContainer"></div>
<div id="previewContainer"></div>
```