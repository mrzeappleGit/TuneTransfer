window.onload = function() {
    console.log("TuneTransfer: Loaded");
    var tunetransferElement = document.createElement("button");
    tunetransferElement.id = "tunetransfer";
    tunetransferElement.className = "yt-uix-button yt-uix-button-size-default yt-uix-button-default";
    tunetransferElement.type = "button";
    tunetransferElement.innerHTML = "<img src='https://raw.gi' id='tuneTransferImage' style='width: 20px; height: 20px; margin-right: 5px; margin-bottom: 2px;'>";
    document.getElementById("subscribe-button").insertAdjacentElement("afterEnd", tunetransferElement);
};