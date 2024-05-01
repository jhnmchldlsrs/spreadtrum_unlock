import {FastbootDevice, FastbootError} from "../dist/js/fastboot.mjs";
import {default as defaultKey} from "./default_key.js";

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
    document.getElementById("info-modal-body").innerHTML = cmd.text.replace("\n", "<br>");
}

async function rebootDevice() {
    let cmd = await device.runCommand("reboot");
}

async function unlockBootloader() {
    console.debug("Called unlockBootloader()");
    
    try {
        const resp = await device.runCommand("oem get_identifier_token");
        const identifierToken = resp.text.split('\n')[2];
        const identifier = identifierToken + "0".repeat(64 * 2).substring(identifierToken.length);

        console.debug("Identifier:", identifier);

        if (identifier.length > (64 * 2)) {
            throw new FastbootError(
                "FAIL",
                `Identifier token size overflow: ${identifier.length} is more than ${64 * 2} digits`);
        }

        let privateKey = defaultKey;

        const sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
        sig.init(privateKey);
        const signature = sig.signHex(identifier);
        const buffer = new Uint8Array(signature.match(/[\dA-F]{2}/gi).map(s => parseInt(s, 16)))

        // Bootloader requires an 8-digit hex number
        let xferHex = buffer.byteLength.toString(16).padStart(8, "0");
        if (xferHex.length !== 8) {
            throw new FastbootError(
                "FAIL",
                `Transfer size overflow: ${xferHex} is more than 8 digits`
            );
        }

        // Check with the device and make sure size matches
        let downloadResp = await device.runCommand(`download:${xferHex}`);
        if (downloadResp.dataSize === null) {
            throw new FastbootError(
                "FAIL",
                `Unexpected response to download command: ${downloadResp.text}`
            );
        }
        let downloadSize = parseInt(downloadResp.dataSize, 16);
        if (downloadSize !== buffer.byteLength) {
            throw new FastbootError(
                "FAIL",
                `Bootloader wants ${buffer.byteLength} bytes, requested to send ${buffer.bytelength} bytes`
            );
        }

        console.log(`Sending payload: ${buffer.byteLength} bytes`);
        await device.sendRawPayload(buffer, () => {});

        console.log("Payload sent, waiting for response...");
        await device.readResponse();

        console.log(await device.runCommand("flashing unlock_bootloader"));

        console log("Unlocked!!");
    } catch (error) {
        console.error(error);
    }
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
    .getElementById("unlock-button")
    .addEventListener("click", function() {
        console.log("info");
        unlockBootLoader();
    });
document
    .getElementById("actual-reboot-button")
    .addEventListener("click", function() {
    
        console.log("reboot");
        rebootDevice();
        
        document.getElementById("reboot-button").disabled = true;
        document.getElementById("info-button").disabled = true;
    });