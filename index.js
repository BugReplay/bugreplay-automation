"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRecording = exports.stopRecording = exports.startRecording = exports.setup = void 0;
var dispatch = function (payload) {
    window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: payload
    }, '*');
};
exports.setup = function (apiKey) {
    return new Promise(function (resolve, reject) {
        window.addEventListener("message", function (event) {
            var _a, _b, _c, _d;
            if ((_d = (_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.nextState) === null || _c === void 0 ? void 0 : _c.popup) === null || _d === void 0 ? void 0 : _d.activeTab) {
                // Don't finish until the report is submitted and processed
                resolve();
            }
        });
        dispatch({
            type: 'SET_API_KEY',
            payload: apiKey,
        });
        dispatch({
            type: 'POPUP_CONNECT'
        });
    });
};
exports.startRecording = function () {
    document.title = "Record This Window";
    dispatch({ type: 'CLICK_START_RECORDING_SCREEN' });
};
exports.stopRecording = function () {
    return new Promise(function (resolve, reject) {
        window.addEventListener("message", function (event) {
            var _a, _b, _c, _d;
            if ((_d = (_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.nextState) === null || _c === void 0 ? void 0 : _c.recording) === null || _d === void 0 ? void 0 : _d.stopped) {
                // Don't finish until the browser has stopped recording
                resolve();
            }
        });
        window.postMessage({
            type: 'REDUX_DISPATCH',
            payload: { type: 'CLICK_STOP_RECORDING' }
        }, '*');
    });
};
exports.saveRecording = function (title, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        window.addEventListener("message", function (event) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (!((_d = (_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.nextState) === null || _c === void 0 ? void 0 : _c.report) === null || _d === void 0 ? void 0 : _d.started) &&
                ((_j = (_h = (_g = (_f = (_e = event === null || event === void 0 ? void 0 : event.data) === null || _e === void 0 ? void 0 : _e.payload) === null || _f === void 0 ? void 0 : _f.nextState) === null || _g === void 0 ? void 0 : _g.reports) === null || _h === void 0 ? void 0 : _h.processing) === null || _j === void 0 ? void 0 : _j.length) === 0) {
                // Don't finish until the report is submitted and processed
                resolve();
            }
        });
        window.postMessage({
            type: 'REDUX_DISPATCH',
            payload: {
                type: 'UPDATE_REPORT',
                payload: {
                    updates: __assign({ title: title }, options)
                },
            }
        }, '*');
        window.postMessage({
            type: 'REDUX_DISPATCH',
            payload: {
                type: 'CLICK_SUBMIT_REPORT',
            }
        }, '*');
        window.postMessage({
            type: 'REDUX_DISPATCH',
            payload: { type: 'POPUP_DISCONNECT' }
        }, '*');
    });
};
exports.default = {
    setup: exports.setup,
    startRecording: exports.startRecording,
    stopRecording: exports.stopRecording,
    saveRecording: exports.saveRecording
};
