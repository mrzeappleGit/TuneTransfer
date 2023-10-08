var clientAccessToken = null;
var numTries = 0;
var trackID = null;
function send_message() {
    chrome.runtime.sendMessage({ message: 'get_access_token' }, function (response) {
        if (response && response.message) {
            clientAccessToken = response.message;
            
        } else {
            
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
    tunetransferElement.addEventListener("click", function(){tuneTransferClick()});
    setTimeout(function() {
        if(document.querySelectorAll('[itemprop="genre"]')[0].getAttribute('content') == "Music"){
            document.getElementById("subscribe-button").insertAdjacentElement("afterEnd", tunetransferElement);
                    
                    send_message();
            }
    }, 1000);
};

function tuneTransferClick(){
    var popOverElemet = document.createElement("div");
    popOverElemet.id = "tuneTransferPopOver";
    popOverElemet.style = "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 9999;";
    popOverElemet.addEventListener("click", function(){popOverClick()});
    popOverElemet.innerHTML = `
        <div style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 425px; height: 295px; background-color: white; border-radius: 10px;'>
            <div style='width: 100%; height: 50px; background-color: #F2F1F1; border-radius: 10px 10px 0px 0px;'>
                <div style='position: absolute; top: 10px; left: 10px;'>
                    <img src='https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/icons/icon_128.png' style='width: 30px; height: 30px;'>
                </div>
                <div style='position: absolute; top: 10px; left: 50px;'>
                    <p style='font-size: 20px; font-weight: bold;'>TuneTransfer</p>
                </div>
                <div style='position: absolute; top: 10px; right: 10px;'>
                    <button id='tuneTransferPopOverCloseButton' onclick='document.getElementById("tuneTransferPopOver").remove();' style='width: 30px; height: 30px; border-radius: 5px; background-color: #F2F1F1; border: 0px; cursor: pointer;'>
                        <img src='https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/close.png' style='width: 20px; height: 20px;'>
                    </button>
                </div>
                <div style='position: absolute; top: 60px; left: 10px; padding-right: 10px; width: 95%;'>
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
async function spotifyLookup(){
    
    //make sure spotify access token is valid
    var spotifyAccessToken = localStorage.getItem("spotifyAccessToken");
    if (spotifyAccessToken == null) {
        
        spotifyGetAccessToken(function(token) {
            if (token) {
                performSpotifySearch(token);
            } else {
                console.warn("Failed to retrieve the Spotify token.");
            }
        });
    } else {
        
        performSpotifySearch(spotifyAccessToken);
    }
}

function performSpotifySearch(spotifyAccessToken) {

    
    spotifyGetPlaylists();
    var songTitle = document.querySelector("#title h1 yt-formatted-string").innerText;
    //remove all special characters from song title except dashes and spaces
    songTitle = songTitle.replace(/[^a-zA-Z0-9 -]/g, "");
    //replace all spaces with dashes
    songTitle = songTitle.replace(/ /g, "-");
    //replace any multiple dashes with a single dash
    songTitle = songTitle.replace(/-+/g, "-");
    //replace the words music video with nothing ignore case
    songTitle = songTitle.replace(/-music-video/i, "");
    //replace the words official video with nothing ignore case
    songTitle = songTitle.replace(/-official-video/i, "");
    //replace the words official music video with nothing ignore case
    songTitle = songTitle.replace(/-official-music-video/i, "");
    //replace the words official lyric video with nothing ignore case
    songTitle = songTitle.replace(/-official-lyric-video/i, "");
    //replace the words lyric video with nothing ignore case
    songTitle = songTitle.replace(/-lyric-video/i, "");
    //replace the words lyrics with nothing ignore case
    songTitle = songTitle.replace(/-lyrics/i, "");

    
    var spotifySearchUrl = "https://api.spotify.com/v1/search?q=" + songTitle + "&type=track&limit=1";
    var spotifySearchRequest = new XMLHttpRequest();
    spotifySearchRequest.open("GET", spotifySearchUrl, true);
    spotifySearchRequest.setRequestHeader("Authorization", "Bearer " + spotifyAccessToken);
    spotifySearchRequest.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var spotifySearchResponse = JSON.parse(this.response);
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
                songInfoDiv.style = "display: flex; align-self: start;";
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
                trackID = spotifySearchResponse.tracks.items[0].id;
                if(spotifyPlaylists.length > 0){
                    var playlistDiv = document.createElement("div");
                    playlistDiv.style = "width: 100%;";
                    playlistDiv.id = "tuneTransferPopOverInfoPlaylists";
                    document.getElementById("tuneTransferPopOverInfo").appendChild(playlistDiv);
                    document.getElementById("tuneTransferPopOverInfoPlaylists").innerHTML += `<select id='tuneTransferPopOverSelect' style='width: 60%; height: 30px; border-radius: 5px;'>
                                                                                        <option value=''>Select Playlist</option>
                                                                                        ${spotifyPlaylists.map(playlist => `<option value='${playlist.id}'>${playlist.name}</option>`).join('')}
                                                                                    </select>`;
                                                                                
                    //put add to playlist button into pop over
                    document.getElementById("tuneTransferPopOverInfoPlaylists").innerHTML += `<button id='tuneTransferPopOverButton' style='width: 30%; margin-left: 10%; border-radius: 5px; background-color: #1DB954; padding-top: 10px; padding-bottom: 10px; border: 0px; color: white; font-weight: bold; cursor: pointer;'>Add to Playlist</button>`;
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
                                //remove pop over
                                document.getElementById("tuneTransferPopOver").remove();
                            }
                        };
                        spotifyAddSongRequest.send();
                    });
                }else{
                    var playlistAndLoggedoutDiv = document.createElement("div");
                    playlistAndLoggedoutDiv.style = "width: 100%;";
                    playlistAndLoggedoutDiv.id = "tuneTransferPopOverInfoPlaylistsAndLoggedOut";
                    document.getElementById("tuneTransferPopOverInfo").appendChild(playlistAndLoggedoutDiv);
                    document.getElementById("tuneTransferPopOverInfoPlaylistsAndLoggedOut").innerHTML += `<p style='font-size: 15px;'>No Playlists Found Check if you are signed in or close the popup and reopen it</p> <button id='refreshPlaylist' style='width: 100px; height: 30px; border-radius: 5px; background-color: #1DB954; color: white; font-weight: bold; cursor: pointer; border: 0px;'>Refresh</button>`;
                    setTimeout(function(){
                        document.getElementById("refreshPlaylist").addEventListener("click", function(){refreshPlaylists()});
                    }, 1000);
                }
                //add button link to open song in spotify
                document.getElementById("tuneTransferPopOverInfo").innerHTML += `<a href='${spotifySearchResponse.tracks.items[0].external_urls.spotify}' target='_blank' style='width: 100%; height: 30px; border-radius: 5px; background-color: #1DB954; color: white; font-weight: bold; cursor: pointer; text-decoration: none; text-align: center; line-height: 30px; padding-top: 10px; padding-bottom: 10px; font-size: 15px;'>Open in Spotify</a>`;                

                

            }
        }
    };
    spotifySearchRequest.send();
}
function refreshPlaylists(){
    if(spotifyPlaylists.length > 0){
        var playlistDiv = document.createElement("div");
                        playlistDiv.style = "width: 100%;";
                        playlistDiv.id = "tuneTransferPopOverInfoPlaylists";
                        document.getElementById("tuneTransferPopOverInfoPlaylistsAndLoggedOut").innerHTML = "";
                        document.getElementById("tuneTransferPopOverInfoPlaylistsAndLoggedOut").appendChild(playlistDiv);
                        playlistDiv.innerHTML += `<select id='tuneTransferPopOverSelect' style='width: 60%; height: 30px; border-radius: 5px;'>
                                                                                            <option value=''>Select Playlist</option>
                                                                                            ${spotifyPlaylists.map(playlist => `<option value='${playlist.id}'>${playlist.name}</option>`).join('')}
                                                                                        </select>`;
                                                                                    
                        //put add to playlist button into pop over
                        document.getElementById("tuneTransferPopOverInfoPlaylists").innerHTML += `<button id='tuneTransferPopOverButton' style='width: 30%; margin-left: 10%; border-radius: 5px; background-color: #1DB954; padding-top: 10px; padding-bottom: 10px; border: 0px; color: white; font-weight: bold; cursor: pointer;'>Add to Playlist</button>`;
                        //add event listener to button
                        document.getElementById("tuneTransferPopOverButton").addEventListener("click", function(){
                            //get playlist id from select
                            var playlistId = document.getElementById("tuneTransferPopOverSelect").value;
                            //add song to playlist
                            var spotifyAddSongUrl = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?uris=spotify:track:" + trackID;
                            var spotifyAddSongRequest = new XMLHttpRequest();
                            spotifyAddSongRequest.open("POST", spotifyAddSongUrl, true);
                            spotifyAddSongRequest.setRequestHeader("Authorization", "Bearer " + clientAccessToken);
                            spotifyAddSongRequest.onload = function() {
                                if (this.status >= 200 && this.status < 400) {
                                    var spotifyAddSongResponse = JSON.parse(this.response);
                                    
                                    //remove pop over
                                    document.getElementById("tuneTransferPopOver").remove();
                                }
                            };
                            spotifyAddSongRequest.send();
                        });
    }
}
//function to send message to background.js to get spotify access token
function spotifyGetAccessToken(callback){
    chrome.runtime.sendMessage({ message: 'get_access_token_login' }, function (response) {
        
        
        if (!response) {
            console.error("No response from background.");
            return;
        }

        if (response.message == 'success') {
            
            
            let token = response.token;
            callback(token); // Pass the token to the callback
            return token;
        } else if (response.message == "fail") {
            console.warn("Failed to get access token. Maybe not logged in.");
            document.getElementById("tuneTransferPopOverInfo").innerHTML += '<p style="font-size: 15px; text-align: center;">Looks like you are not logged in a window should appear for you to login if not close this then reopen.</p>';
        } else {
            
            numTries++;
            if (numTries <= 10) {
                setTimeout(send_message, 1000); // wait 1 second before trying again
            } else {
                console.error("Max retries reached for fetching access token.");
            }
        }
    });
}



function popOverClick(){
    //check to see if click is on the inner div of the pop over
    if(event.target.id == "tuneTransferPopOver" || event.target.id == "tuneTransferPopOverCloseButton"){
        document.getElementById("tuneTransferPopOver").remove();
    }
}