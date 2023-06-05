var clientAccessToken = null;
var numTries = 0;
function send_message() {
    chrome.runtime.sendMessage({ message: 'get_access_token' }, function (response) {
        if (response && response.message) {
            clientAccessToken = response.message;
            console.log(clientAccessToken);
        } else {
            console.log("No response received. Retrying in 1 second...");
            numTries++;
            if (numTries > 10) {

            }else{
                setTimeout(send_message, 1000); // wait 1 second before trying again
            }
        }
    });
}
window.onload = function() {
    var tunetransferElement = document.createElement("button");
    tunetransferElement.id = "tunetransfer";
    tunetransferElement.className = "yt-uix-button yt-uix-button-size-default yt-uix-button-default";
    tunetransferElement.type = "button";
    tunetransferElement.style = "background-color: #F2F1F1; cursor: pointer; margin-left: 10px; border-radius: 20px;";
    tunetransferElement.innerHTML = "<img src='https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/spotify-logo.png' id='tuneTransferImage' style='width: 20px; height: 20px; margin: 5px;'>";
    tunetransferElement.addEventListener("click", tuneTransferClick);
    setTimeout(function() {
        if(document.querySelectorAll(".ytd-video-description-music-section-renderer") != null && document.querySelectorAll(".ytd-video-description-music-section-renderer").length > 0){
            document.getElementById("subscribe-button").insertAdjacentElement("afterEnd", tunetransferElement);
                    console.log("waiting for access token");
                    send_message();
            }
    }, 1000);
};

function tuneTransferClick(){
    var popOverElemet = document.createElement("div");
    popOverElemet.id = "tuneTransferPopOver";
    popOverElemet.style = "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 9999;";
    popOverElemet.addEventListener("click", popOverClick);
    popOverElemet.innerHTML = `
        <div style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 425px; height: 280px; background-color: white; border-radius: 10px;'>
            <div style='width: 100%; height: 50px; background-color: #F2F1F1; border-radius: 10px 10px 0px 0px;'>
                <div style='position: absolute; top: 60px; left: 10px;'>
                    <div id="tuneTransferPopOverInfo" style='width: 100%; height: 100%; display: flex; flex-direction: column; gap: 20px; justify-content: space-around; align-items: center;'>
                    
                    </div>
                </div>
            </div>
        </div>`;
        spotifyLookup();
    document.body.appendChild(popOverElemet);
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
async function fetchPlaylists(token, userId) {
    const result = await fetch("https://api.spotify.com/v1/users/" + userId + "/playlists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}
var spotifyPlaylists = [];
//create spotify request for users playlist
function spotifyGetPlaylists(){
    var userId = null;
    fetchProfile(clientAccessToken).then((profile) => {
        //get spotify user id from profile
        userId = profile.id;
        if(userId != null){
            fetchPlaylists(clientAccessToken, userId).then((playlists) => {
            
                    //var spotifyGetPlaylistsResponse = JSON.parse(this.response);
                //set array of playlists from response names and ids
                for(var i = 0; i < playlists.items.length; i++){
                    spotifyPlaylists.push({name: playlists.items[i].name, id: playlists.items[i].id});
                }
            });
        }
    });
    //get current users spotify id
}
function spotifyLookup(){
    //make sure spotify access token is valid
    var spotifyAccessToken = localStorage.getItem("spotifyAccessToken");
    if(spotifyAccessToken == null){
        spotifyAccessToken = spotifyGetAccessToken();
    }
    spotifyGetPlaylists();
    var songTitle = document.querySelector("#title h1 yt-formatted-string").innerText;
    //remove all special characters from song title except dashes and spaces
    songTitle = songTitle.replace(/[^a-zA-Z0-9 -]/g, "");
    //replace all spaces with dashes
    songTitle = songTitle.replace(/ /g, "-");
    //replace any multiple dashes with a single dash
    songTitle = songTitle.replace(/-+/g, "-");
    console.log(songTitle);
    var spotifySearchUrl = "https://api.spotify.com/v1/search?q=" + songTitle + "&type=track&limit=1";
    var spotifySearchRequest = new XMLHttpRequest();
    spotifySearchRequest.open("GET", spotifySearchUrl, true);
    spotifySearchRequest.setRequestHeader("Authorization", "Bearer " + clientAccessToken);
    spotifySearchRequest.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var spotifySearchResponse = JSON.parse(this.response);
            console.log(spotifySearchResponse);
            if(spotifySearchResponse.tracks.items.length > 0){
               //spotify get album art
                var spotifyAlbumArtUrl = spotifySearchResponse.tracks.items[0].album.images[0].url;
                //spotify get song name
                var spotifySongName = spotifySearchResponse.tracks.items[0].name;
                //spotify get artist name
                var spotifyArtistName = spotifySearchResponse.tracks.items[0].artists[0].name;
                //spotify get album name
                var spotifyAlbumName = spotifySearchResponse.tracks.items[0].album.name;
                var songInfoDiv = document.createElement("div");
                songInfoDiv.style = "display: flex;";
                songInfoDiv.id = "tuneTransferPopOverInfoSongInfo";
                document.getElementById("tuneTransferPopOverInfo").appendChild(songInfoDiv);
                //put album art into pop over
                document.getElementById("tuneTransferPopOverInfoSongInfo").innerHTML += `<img src='${spotifyAlbumArtUrl}' style='width: 100px; height: 100px;'>`;
                var songTitleDiv = document.createElement("div");
                songTitleDiv.style = "margin-left: 20px;";
                songTitleDiv.id = "tuneTransferPopOverInfoSongTitle";
                document.getElementById("tuneTransferPopOverInfoSongInfo").appendChild(songTitleDiv);
                //put song name into pop over
                document.getElementById("tuneTransferPopOverInfoSongTitle").innerHTML += `<p style='font-size: 20px; font-weight: bold;'>${spotifySongName}</p>`;
                //put artist name into pop over
                document.getElementById("tuneTransferPopOverInfoSongTitle").innerHTML += `<p style='font-size: 15px;'>${spotifyArtistName}</p>`;
                //put album name into pop over
                document.getElementById("tuneTransferPopOverInfoSongTitle").innerHTML += `<p style='font-size: 15px;'>${spotifyAlbumName}</p>`;
                //put playlist select into pop over with the values from the spotifyPlaylists array when it is populated
                if(spotifyPlaylists.length > 0){
                document.getElementById("tuneTransferPopOverInfo").innerHTML += `<select id='tuneTransferPopOverSelect' style='width: 100%; height: 30px; border-radius: 5px;'>
                                                                                    <option value=''>Select Playlist</option>
                                                                                    ${spotifyPlaylists.map(playlist => `<option value='${playlist.id}'>${playlist.name}</option>`).join('')}
                                                                                </select>`;
                                                                                
                    //put add to playlist button into pop over
                    document.getElementById("tuneTransferPopOverInfo").innerHTML += `<button id='tuneTransferPopOverButton' style='width: 100%; height: 30px; border-radius: 5px; background-color: #1DB954; color: white; font-weight: bold; cursor: pointer;'>Add to Playlist</button>`;
                    //add event listener to button
                    document.getElementById("tuneTransferPopOverButton").addEventListener("click", function(){
                        //get playlist id from select
                        var playlistId = document.getElementById("tuneTransferPopOverSelect").value;
                        //get song id from spotify search response
                        var songId = spotifySearchResponse.tracks.items[0].id;
                        //add song to playlist
                        var spotifyAddSongUrl = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?uris=spotify:track:" + songId;
                        var spotifyAddSongRequest = new XMLHttpRequest();
                        spotifyAddSongRequest.open("POST", spotifyAddSongUrl, true);
                        spotifyAddSongRequest.setRequestHeader("Authorization", "Bearer " + clientAccessToken);
                        spotifyAddSongRequest.onload = function() {
                            if (this.status >= 200 && this.status < 400) {
                                var spotifyAddSongResponse = JSON.parse(this.response);
                                console.log(spotifyAddSongResponse);
                                //remove pop over
                                document.getElementById("tuneTransferPopOver").remove();
                            }
                        };
                        spotifyAddSongRequest.send();
                    }
                );
                }else{
                    document.getElementById("tuneTransferPopOverInfo").innerHTML += `<p style='font-size: 15px;'>No Playlists Found Check if you are signed in or close the popup and reopen it</p>`;
                }

                

            }
        }
    };
    spotifySearchRequest.send();
}

function popOverClick(){
    //check to see if click is on the inner div of the pop over
    if(event.target.id == "tuneTransferPopOver"){
        document.getElementById("tuneTransferPopOver").remove();
    }
}