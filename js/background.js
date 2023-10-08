const RESPONSE_TYPE = encodeURIComponent('code');
//Replace Redirect URI with your own
const REDIRECT_URI = encodeURIComponent('');
const SCOPE = encodeURIComponent('playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-private user-read-email');
const SHOW_DIALOG = encodeURIComponent('false');
let REFRESH_TOKEN = '';
let STATE = '';
let ACCESS_TOKEN = '';
let CLIENT_SECRET;
let CLIENT_ID;
var clientAccessToken;

let user_signed_in = false;
async function getAPIKeys(combinedClient){
}
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

    

    return oauth2_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message.startsWith('get_api_keys')) {
        var combinedClient = request.message.substring(13);
        
        getAPIKeys(combinedClient);
    } else if (request.message === 'login') {
        if (user_signed_in) {
            
            sendResponse({ message: 'already_signed_in' });
        } else {
            getAccessToken(false, sendResponse);
        }
        return true; // for asynchronous response
    } else if (request.message === 'logout') {
        user_signed_in = false;
        chrome.action.setPopup({ popup: './popup.html' }, () => {
            sendResponse({ message: 'success' });
            chrome.storage.local.remove("spotifyAccessToken");
        });
        return true; // for asynchronous response
    } else if (request.message === 'get_access_token') {
        chrome.storage.local.get(["spotifyAccessToken", "tokenCreationTime"], function(result) {
            ACCESS_TOKEN = result.spotifyAccessToken;
            let tokenCreationTime = result.tokenCreationTime;
            const ONE_HOUR = 3600 * 1000; // 1 hour in milliseconds
            if (Date.now() - tokenCreationTime > ONE_HOUR || !ACCESS_TOKEN || ACCESS_TOKEN.trim() === "") {
                
                chrome.storage.local.remove("spotifyAccessToken");
                chrome.storage.local.remove("tokenCreationTime");
                getAccessToken(false, function() {
                    // After refreshing the token, send the updated token as response.
                    chrome.storage.local.get("spotifyAccessToken", function(updatedResult) {
                        sendResponse({ message: updatedResult.spotifyAccessToken });
                    });
                });
            } else {
                sendResponse({ message: ACCESS_TOKEN });
            }
        });
        return true; // for asynchronous response
    } else if (request.message === 'get_access_token_login') {
        getAccessToken(true, function(status) {
            
        if (status.message == 'success') {
            // Once the access token is successfully retrieved, send it back.
            
            chrome.storage.local.get("spotifyAccessToken", function(result) {
                sendResponse({ message: 'success', token: result.spotifyAccessToken });
            });
        } else {
            
            sendResponse({ message: 'fail' });
        }
    });
    return true; // to indicate we're responding asynchronously
    }
});


    

function getAccessToken(clickTry, sendResponse) {
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
                ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('code=') + 5);
                ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                let state = redirect_url.substring(redirect_url.indexOf('state=') + 6);

                if (state === STATE) {
                    user_signed_in = true;
                    setTimeout(() => {
                        ACCESS_TOKEN = '';
                        user_signed_in = false;
                        chrome.storage.local.remove("spotifyAccessToken");
                    }, 3600000);

                    exchangeCodeForToken(ACCESS_TOKEN, function(result) {
                        
                        if (result === 'success') {
                            chrome.action.setPopup({ popup: '../popup-signed-in.html' }, () => {
                                sendResponse({ message: 'success' });
                            });
                        } else {
                            sendResponse({ message: 'fail' });
                        }
                    });

                    if (clickTry) {
                        return "success";
                    }
                } else {
                    
                    
                    sendResponse({ message: 'fail' });
                    return "fail";
                }
            }
        }
    });
    
    return true; // for asynchronous chrome calls
}



async function exchangeCodeForToken(code, callback) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', decodeURIComponent(REDIRECT_URI));
    body.append('client_id', decodeURIComponent(CLIENT_ID));
    body.append('client_secret', CLIENT_SECRET);
    

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        if (response.ok) {
            const data = await response.json();
            ACCESS_TOKEN = data.access_token;
            REFRESH_TOKEN = data.refresh_token;
            clientAccessToken = ACCESS_TOKEN;

            const tokenCreationTime = Date.now(); // Get the current time
            

            chrome.storage.local.set({
                "spotifyAccessToken": ACCESS_TOKEN,
                "tokenCreationTime": tokenCreationTime  // Save the creation time
            }, function() {
                // When data is saved, call the callback with 'success'
                callback('success');
            });
        } else {
            console.error('Response:', response.status, response.statusText);
            callback('fail'); // Call the callback with 'fail' if response is not okay
        }
    } catch (error) {
        console.error('An error occurred:', error);
        callback('fail'); // Call the callback with 'fail' if there's an error
    }
}



// Refresh access_token using refresh_token
async function refreshToken() {
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', REFRESH_TOKEN);
    body.append('client_id', CLIENT_ID);
    body.append('client_secret', CLIENT_SECRET);

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        if (response.ok) {
            const data = await response.json();
            ACCESS_TOKEN = data.access_token;
            chrome.storage.local.set({ "spotifyAccessToken": ACCESS_TOKEN }, function(){
                //  A data saved callback omg so fancy
            });
            // Save this token as needed...
        } else {
            console.error('Response:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}