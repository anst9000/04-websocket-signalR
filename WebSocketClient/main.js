var connectionUrl = document.getElementById("connectionUrl");
var connectButton = document.getElementById("connectButton");
var stateLabel = document.getElementById("stateLabel");
var sendMessage = document.getElementById("sendMessage");
var sendButton = document.getElementById("sendButton");
var commsLog = document.getElementById("commsLog");
var closeButton = document.getElementById("closeButton");
var recipients = document.getElementById("recipients");
var connID = document.getElementById("connIDLabel");
connectionUrl.value = "ws://localhost:5000";

connectButton.onclick = function () {
    stateLabel.innerHTML = "Attempting to connect...";
    socket = new WebSocket(connectionUrl.value);

    socket.onopen = function (event) {
        updateState();
        commsLog.innerHTML += `
        <tr>
            <td colspan="3" class="commslog-data">Connection opened</td>
        </tr>`        
    };

    socket.onclose = function (event) {
        updateState();
        commsLog.innerHTML += `
        <tr>
            <td colspan="3" class="commslog-data">
                Connection closed. Code: ${htmlEscape(event.code)}. Reason: ${htmlEscape(event.reason)}
            </td>
        </tr>`
    };

    socket.onerror = updateState;

    socket.onmessage = function (event) {
        commsLog.innerHTML += `
        <tr>
            <td class="commslog-server">Server</td>
            <td class="commslog-client">Client</td>
            <td class="commslog-data">${htmlEscape(event.data)}</td>
        </tr>`
    };
};

function htmlEscape(str) {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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

    if (!socket) {
        disable();
    } else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                connID.innerHTML = "ConnID: N/A";
                disable();
                connectionUrl.disabled = false;
                connectButton.disabled = false;
                break;
            case WebSocket.CLOSING:
                stateLabel.innerHTML = "Closing...";
                disable();
                break;
            case WebSocket.CONNECTING:
                stateLabel.innerHTML = "Connecting...";
                disable();
                break;
            case WebSocket.OPEN:
                stateLabel.innerHTML = "Open";
                enable();
                break;
            default:
                stateLabel.innerHTML = `Unknown WebSocket State: ${htmlEscape(socket.readyState)}`
                disable();
                break;
        }
    }
}