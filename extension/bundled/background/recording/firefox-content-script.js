(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
  This script runs from within an otherwise blank web page hosted by bugreplay.
  We do this because navigator.mediaDevices.getUserMedia never resolves in the background script.
  Messages, including each frame of the video, are then sent back to the background script.
*/
console.log('CONTENT SCRIPT RUNNING...');
let stream;
let outputStream;
let videoRecorder;
let isStopped = false;
let recordMic;
let recordVideo;
let countdownTimer;
let audioCtx;
let mediaStremDestination;
let micstream;
let micsource;
const setupRecording = () => {
    /**
     * toggle audio on/off when recording video
     * @param enable: boolean
     */
    const toggleMicrophone = (enable) => {
        if (!enable) {
            micsource.disconnect(mediaStremDestination);
        }
        else if (enable) {
            micsource.connect(mediaStremDestination);
        }
    };
    // If screen-sharing permissions are turned off for the page, then navigator.mediaDevices.getUserMedia will .catch with a NotAllowedError
    // very quickly. So, we keep track of how much time elapsed between navigator.mediaDevices.getUserMedia being called and a NotAllowedError
    // being thrown to determine whether the user had time to choose media themselves.
    let userHadTimeToChooseMediaThemselves = false;
    const listener = (message, sender, sendResponse) => {
        if (message.type === 'FIREFOX_VIDEO_RECORDING_STOP') {
            stop();
        }
        else if (message.type === 'ff-microphone-toggle') {
            toggleMicrophone(message.enable);
        }
    };
    const stop = () => {
        if (isStopped)
            return;
        isStopped = true;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (outputStream) {
            outputStream.getTracks().forEach(track => track.stop());
        }
        if (videoRecorder) {
            videoRecorder.stop();
        }
        browser.runtime.onMessage.removeListener(listener);
    };
    function withStream(s) {
        try {
            stream = s;
            if (recordVideo) {
                outputStream = new MediaStream();
                audioCtx = new AudioContext();
                mediaStremDestination = audioCtx.createMediaStreamDestination();
                const audiostream = new MediaStream(stream.getAudioTracks());
                micstream = audiostream;
                micsource = audioCtx.createMediaStreamSource(micstream);
                micsource.connect(mediaStremDestination);
                outputStream.addTrack(mediaStremDestination.stream.getAudioTracks()[0]);
                outputStream.addTrack(stream.getVideoTracks()[0]);
                stream = outputStream;
            }
            // get video track from media stream
            const [track] = stream.getVideoTracks();
            // listen to video track end event, due to any external action stoping the video
            track.onended = () => {
                // stops the video tracks and removes listener.
                stop();
                // send message to runtime, so that we can listen and update redux state: background.ts
                chrome.runtime.sendMessage({
                    type: 'REDUX_DISPATCH',
                    payload: { type: 'CLICK_STOP_RECORDING' },
                });
            };
            if (recordMic) {
                videoRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8,opus',
                });
            }
            else {
                videoRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8',
                });
            }
            videoRecorder.onstart = () => {
                if (document.getElementById('message')) {
                    // @ts-ignore
                    document.getElementById('message').innerHTML =
                        'Please leave this window open during the recording. It will close automatically when the recording has finished';
                }
                else {
                    document.body.innerHTML =
                        '<p>Please leave this window open during the recording. It will close automatically when the recording has finished.</p>';
                }
                browser.runtime.sendMessage({
                    type: 'FIREFOX_VIDEO_RECORDING_START',
                });
                if (recordVideo) {
                    setTimeout(() => {
                        browser.runtime.sendMessage({
                            type: 'sources-loaded',
                        });
                    }, 0);
                }
            };
            videoRecorder.ondataavailable = frame => {
                const data = frame.data;
                const hasData = !!data && !!data.size;
                if (!hasData && isStopped) {
                    return browser.runtime.sendMessage({
                        type: 'FIREFOX_VIDEO_RECORDING_SUCCESS',
                    });
                }
                if (hasData) {
                    const now = Date.now();
                    const reader = new FileReader();
                    reader.addEventListener('loadend', () => {
                        const result = reader.result;
                        browser.runtime.sendMessage({
                            type: 'FIREFOX_VIDEO_RECORDING_FRAME',
                            data: result.substr(result.lastIndexOf(',') + 1),
                            timestamp: now,
                        });
                        if (isStopped) {
                            browser.runtime.sendMessage({
                                type: 'FIREFOX_VIDEO_RECORDING_SUCCESS',
                            });
                        }
                    });
                    reader.readAsDataURL(data);
                }
            };
            videoRecorder.onerror = videoRecorder.onwarning = error => {
                console.error(error);
                browser.runtime.sendMessage({
                    type: 'FIREFOX_VIDEO_RECORDING_FAILURE',
                    error: error.message,
                });
                stop();
            };
            videoRecorder.start(1000);
        }
        catch (error) {
            console.error(error);
        }
    }
    browser.runtime.onMessage.addListener(listener);
    console.log(window.location.search);
    recordMic =
        (window.location.search.split('audio=')[1] &&
            window.location.search.split('audio=')[1].split('&')[0] === 'true') ||
            (window.location.search.split('camera=')[1] &&
                window.location.search.split('camera=')[1].split('&')[0] === 'true');
    recordVideo =
        window.location.search.split('camera=')[1] &&
            window.location.search.split('camera=')[1].split('&')[0] === 'true';
    if (window.location.search.split('countdown=')[1] &&
        window.location.search.split('countdown=')[1].split('&')[0] === 'true') {
        countdownTimer = true;
    }
    navigator.mediaDevices
        .getUserMedia({
        audio: recordMic,
        video: {
            mediaSource: 'window',
        },
    })
        .then(mediaStream => {
        if (countdownTimer) {
            browser.runtime.sendMessage({
                type: 'FIREFOX_VIDEO_RECORDING_COUNTDOWN_START',
            });
            setTimeout(() => {
                withStream(mediaStream);
            }, 3000);
        }
        else {
            withStream(mediaStream);
        }
    })
        .catch(error => {
        console.error(error);
        // The recording didn't fail if the user cancelled it so we classify this separately
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
            if (document.getElementById('message')) {
                // @ts-ignore
                document.getElementById('message').innerHTML =
                    "Sorry, an error occured when screensharing. Please see <a href='https://bugreplay.zendesk.com/hc/en-us/articles/360039701694-How-to-Enable-the-Screen-Sharing-Permission-on-Firefox'>this article</a> for how to resolve this issue.";
            }
            return browser.runtime.sendMessage({
                type: userHadTimeToChooseMediaThemselves
                    ? 'FIREFOX_VIDEO_RECORDING_NOT_ALLOWED'
                    : 'FIREFOX_VIDEO_RECORDING_NOT_ALLOWED_PREVIOUSLY',
            });
        }
        if (document.getElementById('message')) {
            // @ts-ignore
            document.getElementById('message').innerHTML =
                'Sorry, an error occured when screensharing.';
        }
        stop();
        browser.runtime.sendMessage({
            type: 'FIREFOX_VIDEO_RECORDING_FAILURE',
            error: error.message,
        });
    });
    setTimeout(() => {
        userHadTimeToChooseMediaThemselves = true;
    }, 100);
};
function runContentScript(browser, navigator, MediaRecorder, document, FileReader) {
    if (document.getElementById('error-link')) {
        document.getElementById('error-link').addEventListener('click', () => {
            document.getElementById('error-detail').style.display = 'block';
        });
    }
    if (document.getElementById('message')) {
        document.getElementById('message').innerHTML =
            'Please select a window to record. Select "BugReplay Recording" to return to the previous browser tab and begin recording the website you were visiting. <p>BugReplay needs permission to start the recording. </br><button id="setup-recording" class="allow-btn"> Allow </button></p>';
    }
    else {
        document.body.innerHTML =
            '<p>Please select a window to record. Select "BugReplay Recording" to return to the previous browser tab and begin recording the website you were visiting. BugReplay needs permission to start the recording. </br><button id="setup-recording" class="allow-btn"> Allow </button></p>';
    }
    document.getElementById('setup-recording').onclick = setupRecording;
}
exports.runContentScript = runContentScript;
if (typeof window !== 'undefined') {
    runContentScript(browser, navigator, MediaRecorder, document, FileReader);
}

},{}]},{},[1]);
