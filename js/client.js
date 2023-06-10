function getClientSecret(){
        /*
        REPLACE WITH YOUR OWN LAMDA LINK
        fetch('', {
            method: 'POST',
          })
          .then(response => response.json())
          .then(apiKey => {
            // You now have your API key
            return apiKey;
          });*/
    
    //If not using Lamda, use this function instead
    //REPLACE THESE WITH YOUR OWN CLIENT SECRET AND CLIENT ID
      CLIENT_SECRET = "";
      CLIENT_ID = "";
      var clientCombinded = CLIENT_SECRET + "," + CLIENT_ID;
      chrome.runtime.sendMessage({ message: 'get_api_keys:' + clientCombinded });
  };
  getClientSecret();