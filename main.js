"use strict";
const { app, BrowserWindow } = require('electron')

let win;

function createWindow() {
  win = new BrowserWindow({ height: 850, width: 850});

  win.loadFile('./views/home.html');
}

app.on('ready', createWindow);
