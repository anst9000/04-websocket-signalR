//API Docs: https://docs.microsoft.com/en-us/javascript/api/%40aspnet/signalr/index?view=signalr-js-latest

"use strict";
let connectionUrl = document.getElementById("connectionUrl");
let connectButton = document.getElementById("connectButton");
let stateLabel = document.getElementById("stateLabel");
let sendMessage = document.getElementById("sendMessage");
let sendButton = document.getElementById("sendButton");
let commsLog = document.getElementById("commsLog");
let closeButton = document.getElementById("closeButton");
let recipients = document.getElementById("recipients");
let connID = document.getElementById("connIDLabel");
let visualStatus = document.getElementById("visualStatus");

const hubConnState = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
};

connectionUrl.value = "http://localhost:5000/chatHub";

let hubConnection = new signalR.HubConnectionBuilder()
  .withUrl(connectionUrl.value)
  .build();

//CONNECT BUTTON
connectButton.onclick = function () {
  stateLabel.innerHTML = "Attempting to connect...";

  hubConnection.start().then(function () {
    updateState();

    commsLog.innerHTML += `
      <tr>
        <td colspan="3" class="commslog-data">Connection opened</td>
      </tr>`;
  });
};

closeButton.onclick = function () {
  if (!hubConnection || hubConnection.state !== hubConnState.CONNECTED) {
    alert("Hub Not Connected");
  }

  hubConnection.stop().then(function () {
    console.debug("Requested stop on hub");
  });
};

// CLOSE EVENT
hubConnection.onclose(function (event) {
  updateState();
  commsLog.innerHTML += `
    <tr>
      <td colspan="3" class="commslog-data">Connection disconnected</td>
    </tr>`;
});

hubConnection.on("ReceiveMessage", function (message) {
  commsLog.innerHTML += `
    <tr>
      <td class="commslog-server">Server</td>
      <td class="commslog-client">Client</td>
      <td class="commslog-data">${htmlEscape(message)}</td>
    </tr>`;
});

hubConnection.on("ReceiveConnID", function (connid) {
  console.log("--> connid", connid);
  connID.innerHTML = "ConnID: " + connid;
  commsLog.innerHTML += `
    <tr>
      <td colspan="3" class="commslog-data">Connection ID Received from Hub</td>
    </tr>`;
});

sendButton.onclick = function (event) {
  event.preventDefault();

  let message = constructJSONPayload();

  hubConnection.invoke("SendMessageAsync", message);
  console.debug("SendMessage Invoked, on ID: " + hubConnection.id);

  commsLog.innerHTML += `
    <tr>
      <td class="commslog-client">Client</td>
      <td class="commslog-server">Server</td>
      <td class="commslog-data">${htmlEscape(message)}</td>
    </tr>`;
};

function htmlEscape(str) {
  return str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function constructJSONPayload() {
  return JSON.stringify({
    From: connID.innerHTML.substring(8, connID.innerHTML.length),
    To: recipients.value,
    Message: sendMessage.value,
  });
}

function updateState() {
  function disable() {
    sendMessage.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
    recipients.disabled = true;
  }

  function enable() {
    sendMessage.disabled = false;
    sendButton.disabled = false;
    closeButton.disabled = false;
    recipients.disabled = false;
  }

  connectionUrl.disabled = true;
  connectButton.disabled = true;

  if (!hubConnection) {
    disable();
  } else {
    switch (hubConnection.state) {
      case hubConnState.DISCONNECTED:
        stateLabel.innerHTML = "Disconnected";
        connID.innerHTML = "ConnID: N/a";
        disable();
        connectionUrl.disabled = false;
        connectButton.disabled = false;
        break;
      case hubConnState.CONNECTING:
        stateLabel.innerHTML = "Connecting...";
        disable();
        break;
      case hubConnState.CONNECTED:
        stateLabel.innerHTML = "Connected";
        enable();
        break;
      default:
        stateLabel.innerHTML =
          "Unknown WebSocket State: " + htmlEscape(hubConnection.state);
        disable();
        break;
    }
  }
}
