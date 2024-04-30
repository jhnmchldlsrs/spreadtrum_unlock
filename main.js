import * as fastboot from "assets/dist/js/fastboot.mjs";

let device = new fastboot.FastbootDevice();

function connect() {
    alert("hi");
    try {
        await device.connect();
        // document.querySelector("#unlock-button").disabled = false;
        document.querySelector("#connect-button").disabled = true;
        // document.querySelector("#device-status").textContent = "Connected!";
    } catch (error) {
        console.error(error);
    }
}

document.getElementById("connect-button").onclick = function() {connect()}