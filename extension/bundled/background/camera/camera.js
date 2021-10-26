(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Inject video to contain camera stream
let htmlinject = "<video id='injected-video' style='height:100%;position:absolute;transform:translateX(-50%);left:50%;right:0;top:0;bottom:0;background-color:#3f4049' playsinline autoplay muted></video>";
document.body.innerHTML += htmlinject;
let video = document.getElementById('injected-video');
const startStreaming = (stream) => {
    // @ts-ignore
    document.getElementById('injected-video').srcObject = stream;
};
const streamingError = error => {
    console.log(error);
};
const initCam = () => {
    const constraints = {
        audio: false,
        video: { width: 1920, height: 1080 },
    };
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(startStreaming)
        .catch(streamingError);
};
initCam();

},{}]},{},[1]);
