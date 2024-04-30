function connect() {
    alert("hi");
}

$(document).ready(() => {
    bsCustomFileInput.init();

    document
        .querySelector("#connect-button")
        .addEventListener("click", connect);
})
