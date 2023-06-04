//setup spotify api
var client_id = "REPLACE WITH SPOTIFY CLIENT ID";
var client_secret = "REPLACE WITH SPOTIFY CLIENT SECRET";

function spotifyGetAccessToken(){
    //create spotify access token request in vanilla javascript
    var request = new XMLHttpRequest();
    request.open("POST", "https://accounts.spotify.com/api/token", true);
    request.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var spotifyAccessTokenResponse = JSON.parse(this.response);
            console.log(spotifyAccessTokenResponse);
            //set tocken into local storage
            localStorage.setItem("spotifyAccessToken", spotifyAccessTokenResponse.access_token);
            return spotifyAccessTokenResponse.access_token;
        }
    };
    request.send("grant_type=client_credentials");
}
spotifyGetAccessToken();
