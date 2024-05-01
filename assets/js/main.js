import {FastbootDevice, FastbootError} from "../dist/js/fastboot.mjs";

var device = new FastbootDevice();

async function connectDevice() {
    try {
        await device.connect();
    } catch (error) {
        console.log(error);
        return;
    }

    let product = await device.getVariable("product");
    let serial = await device.getVariable("serialno");
    let status = `Connected to ${product} (serial: ${serial})`;
    console.log(status);
    
    document.getElementById("connect-button").disabled = true;
    document.getElementById("info-button").disabled = false;
    document.getElementById("reboot-button").disabled = false;
}

async function statDevice() {
    const cmd = await device.runCommand("oem device-info");
    console.log(cmd);
}

async function rebootDevice() {
    let cmd = await device.runCommand("reboot");
}

// if the code works, dont touch it
document
    .getElementById("connect-button")
    .addEventListener("click", function() {
        console.log("connect");
        connectDevice();
    });
document
    .getElementById("info-button")
    .addEventListener("click", function() {
        console.log("info");
        statDevice();
    });
document
    .getElementById("reboot-button")
    .addEventListener("click", function() {
        console.log("reboot");
        rebootDevice();
    });