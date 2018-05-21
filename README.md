# sprinter-sketch

> The Sprinter is Todo list application.

## Requirements

- Must be on Mac OSX
- [SketchApp](https://www.sketchapp.com)
- [Kactus](https://kactus.io) (Generate sketch files, Version control)
- [sketch-preview](https://www.npmjs.com/package/sketch-preview) (If you don't have Sketchapp)

## Setup (for sketch-preview, iOS only)

``` bash
# install dependencies
npm install

# install sketch-preview cli tool globally
npm install sketch-preview -g

# generated site via cli tool
sketch-preview --input=./sketch/iOS/sprinter_iOS.sketch --open

# task runner
gulp export
```

> or you can just regenerate .sketch file with Kactus

## Repository

- [Sprinter](https://github.com/sprinter-group)
