# Gamepad Grid Mouse

## About

This program is meant to allow playing games such as go on OGS or KGS, or chess on lichess, with a gamepad instead of a mouse. Start it up and press a button on your gamepad to activate. Then set up your button configuration (defaults to standard Xbox 360 style mapping) and grid settings.

## Build Instructions

```
npm install --global --production windows-build-tools
npm install robotjs --save
npm run rebuild
npm start
```

Build & Package: 

```
npm install electron-packager -g
electron-packager ./ --arch=x64
electron-packager ./ --arch=ia32
```