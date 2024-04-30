let device = new exports.FastbootDevice();

function connect() {
    console.log("hi");
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