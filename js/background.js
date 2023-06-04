//REPLACE WITH CLIENT_ID
const CLIENT_ID = encodeURIComponent('CLIENT_ID');
const RESPONSE_TYPE = encodeURIComponent('token');
//PLACE EXTENSION ID HERE
const REDIRECT_URI = encodeURIComponent('https://EXTENSTION ID.chromiumapp.org/');
const SCOPE = encodeURIComponent('playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-private user-read-email');
const SHOW_DIALOG = encodeURIComponent('true');
let STATE = '';
let ACCESS_TOKEN = '';

let user_signed_in = false;

function create_spotify_endpoint() {
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    let oauth2_url =
        `https://accounts.spotify.com/authorize
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&state=${STATE}
&scope=${SCOPE}
&show_dialog=${SHOW_DIALOG}
`;

    console.log(oauth2_url);

    return oauth2_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        if (user_signed_in) {
            console.log("User is already signed in.");
        } else {
            // sign the user in with Spotify
            chrome.identity.launchWebAuthFlow({
                url: create_spotify_endpoint(),
                interactive: true
            }, function (redirect_url) {
                if (chrome.runtime.lastError) {
                    sendResponse({ message: 'fail' });
                } else {
                    if (redirect_url.includes('callback?error=access_denied')) {
                        sendResponse({ message: 'fail' });
                    } else {
                        console.log(redirect_url);
                        ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
                        ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                        let state = redirect_url.substring(redirect_url.indexOf('state=') + 6);

                        if (state === STATE) {
                            console.log("SUCCESS")
                            user_signed_in = true;
                            //store access token in chrome extension local storage
                            chrome.storage.local.set({ "spotifyAccessToken": ACCESS_TOKEN }, function(){
                                //  A data saved callback omg so fancy
                            });                            
                            setTimeout(() => {
                                ACCESS_TOKEN = '';
                                user_signed_in = false;
                                chrmoe.storage.local.remove("spotifyAccessToken");
                            }, 3600000);

                            chrome.action.setPopup({ popup: '../popup-signed-in.html' }, () => {
                                sendResponse({ message: 'success' });
                            });
                        } else {
                            sendResponse({ message: 'fail' });
                        }
                    }
                }
            });
        }
      
      return true;
    } else if (request.message === 'logout') {
        user_signed_in = false;
        chrome.action.setPopup({ popup: './popup.html' }, () => {
            sendResponse({ message: 'success' });
            chrmoe.storage.local.remove("spotifyAccessToken");
        });

        return true;
    } else if (request.message === 'get_access_token') {
        chrome.storage.local.get({ "spotifyAccessToken": ACCESS_TOKEN }, function(){
            clientAccessToken = ACCESS_TOKEN;
        });  
        sendResponse({ message: ACCESS_TOKEN });
    }
});
