(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
chrome.runtime.getBackgroundPage((background) => {
    const store = background.store;
    const state = store.getState();
    console.log(state);
    const mediaConstraints = state.recordMic && !state.recordVideo
        ? { audio: true }
        : { audio: true, video: true };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(() => {
        window.close();
    }, error => {
        const pleaseAuthorize = document.getElementById('please-authorize');
        if (pleaseAuthorize) {
            pleaseAuthorize.style.display = 'none';
        }
        const pleaseUnblock = document.getElementById('please-unblock');
        if (pleaseUnblock) {
            pleaseUnblock.style.display = 'block';
        }
        console.log(error);
    });
});

},{}]},{},[1]);
