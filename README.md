# build instructions

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