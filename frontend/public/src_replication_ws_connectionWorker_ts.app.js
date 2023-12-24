/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/replication_ws/connectionWorker.ts":
/*!************************************************!*\
  !*** ./src/replication_ws/connectionWorker.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ \"./src/replication_ws/types.ts\");\n/* harmony import */ var _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./websocketPrimitives */ \"./src/replication_ws/websocketPrimitives.ts\");\n\r\n\r\n//console.log(\"webworker running\")\r\nlet ws = null;\r\nlet sessionId = null;\r\nlet pingTimer = null;\r\nlet wsClosed = false;\r\n// Worker 'IO'\r\nonmessage = (e) => {\r\n    let message = e.data;\r\n    switch (message.func) {\r\n        case \"CREATE\":\r\n            ws = create(message.payload.serverAddress, message.payload.serializableState);\r\n            return null;\r\n        case \"JOIN\":\r\n            ws = join(message.payload.serverAddress, message.payload.sessionId);\r\n            return null;\r\n        case \"CHANGE_NAME\":\r\n            if (ws && sessionId)\r\n                _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.changeName(ws, message.payload.newName);\r\n            return null;\r\n        case \"TERMINATE\":\r\n            if (ws)\r\n                terminate(ws);\r\n            return null;\r\n        case \"SEND\":\r\n            if (ws && sessionId)\r\n                _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.send(ws, message.payload.message);\r\n        default:\r\n            return null;\r\n    }\r\n};\r\nconst sendToMain = (message) => {\r\n    postMessage(message);\r\n};\r\nconst dispatch = (action) => {\r\n    sendToMain({ event: \"DISPATCH\", payload: { action } });\r\n};\r\n// Connection setup\r\nconst constructor = (serverAddress) => {\r\n    let ws = new WebSocket(serverAddress);\r\n    ws.onmessage = (ev) => onMessage(ev);\r\n    ws.onclose = (ev) => onClose(ev);\r\n    ws.onerror = (ev) => onError(ev);\r\n    return ws;\r\n};\r\nconst create = (serverAddress, serializableState) => {\r\n    let ws = constructor(serverAddress);\r\n    startPingTimer(ws);\r\n    ws.onopen = (ev) => {\r\n        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.createSession(ws, serializableState);\r\n    };\r\n    return ws;\r\n};\r\nconst join = (serverAddress, sessionId) => {\r\n    let ws = constructor(serverAddress);\r\n    startPingTimer(ws);\r\n    ws.onopen = (ev) => {\r\n        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.joinSession(ws, sessionId);\r\n    };\r\n    return ws;\r\n};\r\nconst startPingTimer = (ws) => {\r\n    pingTimer = setInterval(() => {\r\n        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.sendPing(ws);\r\n    }, 1000);\r\n};\r\n// teardown\r\nconst terminate = (ws) => {\r\n    wsClosed = true;\r\n    sessionId = null;\r\n    if (pingTimer !== null)\r\n        clearInterval(pingTimer);\r\n    try {\r\n        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.leaveSession(ws);\r\n        ws.close();\r\n    }\r\n    catch (error) {\r\n        // nothing to do here.\r\n    }\r\n};\r\n// Websocket behavior\r\nconst onMessage = (ev) => {\r\n    let message = JSON.parse(ev.data);\r\n    if (message.command == _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationMessageType.joined) {\r\n        sessionId = message.payload.sessionId;\r\n        sendToMain({ event: \"SESSION_ID\", payload: message.payload });\r\n    }\r\n    if (sessionId !== null) {\r\n        dispatch({ type: _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationActionType.receiveMessage, payload: { message, sessionId: sessionId } });\r\n    }\r\n};\r\nconst onClose = (ev) => {\r\n    if (ws)\r\n        terminate(ws);\r\n    sendToMain({ event: \"CLOSE\" });\r\n};\r\nconst onError = (ev) => {\r\n    if (ws)\r\n        terminate(ws);\r\n    sendToMain({ event: \"ERROR\" });\r\n};\r\n\n\n//# sourceURL=webpack://squadstrat/./src/replication_ws/connectionWorker.ts?");

/***/ }),

/***/ "./src/replication_ws/types.ts":
/*!*************************************!*\
  !*** ./src/replication_ws/types.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"newSession\": () => (/* binding */ newSession),\n/* harmony export */   \"newReplicationState\": () => (/* binding */ newReplicationState),\n/* harmony export */   \"ReplicationActionType\": () => (/* binding */ ReplicationActionType),\n/* harmony export */   \"SessionActionType\": () => (/* binding */ SessionActionType),\n/* harmony export */   \"newUser\": () => (/* binding */ newUser),\n/* harmony export */   \"ReplicationMessageType\": () => (/* binding */ ReplicationMessageType),\n/* harmony export */   \"ClientRequestType\": () => (/* binding */ ClientRequestType)\n/* harmony export */ });\nconst newSession = () => ({\r\n    sessionId: \"\",\r\n    userId: \"\",\r\n    users: new Map(),\r\n});\r\nconst newReplicationState = () => ({\r\n    connectionState: \"closed\",\r\n    sessionId: null,\r\n});\r\nvar ReplicationActionType;\r\n(function (ReplicationActionType) {\r\n    ReplicationActionType[\"creatingSession\"] = \"REPLICATION_CREATING_SESSION\";\r\n    ReplicationActionType[\"connectionReady\"] = \"REPLICATION_CONNECTION_READY\";\r\n    ReplicationActionType[\"connectionClosed\"] = \"REPLICATION_CONNECTION_CLOSED\";\r\n    ReplicationActionType[\"connectionError\"] = \"REPLICATION_CONNECTION_ERROR\";\r\n    ReplicationActionType[\"receiveMessage\"] = \"REPLICATION_RECEIVE_MESSAGE\";\r\n    ReplicationActionType[\"sendPing\"] = \"REPLICATION_SEND_PING\";\r\n    ReplicationActionType[\"noop\"] = \"REPLICATION_NOOP\";\r\n})(ReplicationActionType || (ReplicationActionType = {}));\r\n;\r\nvar SessionActionType;\r\n(function (SessionActionType) {\r\n    SessionActionType[\"create\"] = \"SESSION_CREATE\";\r\n    SessionActionType[\"started\"] = \"SESSION_STARTED\";\r\n    SessionActionType[\"ended\"] = \"SESSION_ENDED\";\r\n    SessionActionType[\"join\"] = \"SESSION_JOIN\";\r\n    SessionActionType[\"leave\"] = \"SESSION_LEAVE\";\r\n    SessionActionType[\"addUser\"] = \"SESSION_ADD_USER\";\r\n    SessionActionType[\"removeUser\"] = \"SESSION_REMOVE_USER\";\r\n    SessionActionType[\"changeUserName\"] = \"SESSION_CHANGE_USER_NAME\";\r\n    SessionActionType[\"userNameChanged\"] = \"SESSION_USER_NAME_CHANGED\";\r\n    SessionActionType[\"sendMessage\"] = \"REPLICATION_SEND_MESSAGE\";\r\n})(SessionActionType || (SessionActionType = {}));\r\n;\r\nconst newUser = (id, name) => ({\r\n    id,\r\n    name\r\n});\r\nvar ReplicationMessageType;\r\n(function (ReplicationMessageType) {\r\n    ReplicationMessageType[\"action\"] = \"ACTION\";\r\n    //created = \"CREATED\", // server does not tell you that\r\n    ReplicationMessageType[\"joined\"] = \"JOINED\";\r\n    ReplicationMessageType[\"userJoined\"] = \"USER_JOINED\";\r\n    ReplicationMessageType[\"userLeft\"] = \"USER_LEFT\";\r\n    ReplicationMessageType[\"userChangedName\"] = \"USER_CHANGED_NAME\";\r\n})(ReplicationMessageType || (ReplicationMessageType = {}));\r\nvar ClientRequestType;\r\n(function (ClientRequestType) {\r\n    ClientRequestType[\"action\"] = \"ACTION\";\r\n    ClientRequestType[\"create\"] = \"CREATE\";\r\n    ClientRequestType[\"join\"] = \"JOIN\";\r\n    ClientRequestType[\"ping\"] = \"PING\";\r\n    ClientRequestType[\"changeName\"] = \"CHANGE_NAME\";\r\n    ClientRequestType[\"leave\"] = \"LEAVE\";\r\n})(ClientRequestType || (ClientRequestType = {}));\r\n\n\n//# sourceURL=webpack://squadstrat/./src/replication_ws/types.ts?");

/***/ }),

/***/ "./src/replication_ws/websocketPrimitives.ts":
/*!***************************************************!*\
  !*** ./src/replication_ws/websocketPrimitives.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"send\": () => (/* binding */ send),\n/* harmony export */   \"sendPing\": () => (/* binding */ sendPing),\n/* harmony export */   \"createSession\": () => (/* binding */ createSession),\n/* harmony export */   \"joinSession\": () => (/* binding */ joinSession),\n/* harmony export */   \"changeName\": () => (/* binding */ changeName),\n/* harmony export */   \"leaveSession\": () => (/* binding */ leaveSession)\n/* harmony export */ });\n/* harmony import */ var _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../replication_ws/types */ \"./src/replication_ws/types.ts\");\n\r\n/* for reference only\r\nconst newConnection = (\r\n  uri: string,\r\n  onOpen: (ev: Event) => any,\r\n  onMessage: (ev: MessageEvent) => any,\r\n  onClose: (ev: CloseEvent) => any,\r\n  onError: (ev: Event) => any\r\n): WebSocket => {\r\n  let ws = new WebSocket(uri);\r\n  ws.onopen = onOpen;\r\n  ws.onmessage = (ev: MessageEvent): any => {\r\n    //console.log(\"message: \", ev.data);\r\n    onMessage(ev);\r\n  };\r\n  ws.onclose = (ev: CloseEvent): any => {\r\n    onClose(ev);\r\n  };\r\n  ws.onerror = onError;\r\n  return ws;\r\n}\r\n*/\r\nconst send = (ws, message) => {\r\n    ws.send(JSON.stringify(message));\r\n};\r\nconst sendPing = (ws) => {\r\n    //console.log(\"sending ping\")\r\n    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.ping }));\r\n};\r\nconst createSession = (ws, serizableState) => {\r\n    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.create, payload: { state: serizableState } }));\r\n};\r\nconst joinSession = (ws, sessionId) => {\r\n    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.join, payload: { sessionId } }));\r\n};\r\nconst changeName = (ws, name) => {\r\n    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.changeName, payload: { name } }));\r\n};\r\nconst leaveSession = (ws) => {\r\n    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.leave }));\r\n    ws.close();\r\n};\r\n\n\n//# sourceURL=webpack://squadstrat/./src/replication_ws/websocketPrimitives.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/replication_ws/connectionWorker.ts");
/******/ 	
/******/ })()
;