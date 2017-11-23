# IdWidget

Cropping widget all in "VanillaJS".

### Development Environment Setup

'''
npm install
npm run server

'''

### Usage

Javascript

'''

const IdWidget = require("./widget.js");
IdWidget.Widget.init("container_id")

'''

HTML

'''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IdWidget</title>
  <link rel="stylesheet" type="text/css" href="./dist/css/main.min.css">
</head>
<body>
  <div id="container"></div>
  <script type="text/javascript" src="./dist/js/bundle.min.js"></script>
</body>
</html>

'''