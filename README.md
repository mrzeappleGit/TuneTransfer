<h1 align="center">Welcome to TuneTransfer 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://twitter.com/mrzeapple" target="_blank">
    <img alt="Twitter: mrzeapple" src="https://img.shields.io/twitter/follow/mrzeapple.svg?style=social" />
  </a>
</p>

> Welcome to the GitHub repository for TuneTransfer! This extension seamlessly integrates your musical tastes from YouTube with your Spotify playlists. No longer will you need to switch between platforms to consolidate your favorite tracks.

## Installation


![Spotify Dashboard](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/spotify-dashboard.png)
1. Add Client ID and Client Secrets from spotify to `/js/config.js` to get those go to https://developer.spotify.com/ 
![Spotify API Keys](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/spotify-api-key.png)
2. Navigate to Extensions Page in Chrome: Click on the three vertical dots in the upper-right corner of the Chrome browser window to open the menu. From the menu, hover over "More tools", and click on "Extensions".
3. Enable Developer Mode: On the Extensions page, you’ll see a toggle switch in the top-right corner labeled “Developer mode”. Switch this on. This will reveal additional options, including “Load unpacked”, which you will need. ![Extension Developer Mode](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/extension-dev-mode.png)
4. Load Your Extension: Click on the “Load unpacked” button. This will open a file selection dialog. Navigate to the directory where your extension’s files are located (the directory that contains the manifest.json file), and select it. ![Extension Load Unpacked](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/extension-load-unpacked.png)
5. Get ID from extensions page then add it to `background.js` using this format: `https://YOU-ID.chromiumapp.org/` 
![Spotify API Keys](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/Extension-id.png)
6. Set the redirect URL in spotify Dashboard to the same link you added to background.js
![Spotify Redirect URL](https://raw.githubusercontent.com/mrzeappleGit/TuneTransfer/master/assets/spotify-redirect-url.png)
7. Reload extension

## Author

👤 **Matthew Thomas Stevens**

* Website: https://www.matthewstevens.me
* Twitter: [@mrzeapple](https://twitter.com/mrzeapple)
* Github: [@mrzeapplGit](https://github.com/mrzeapplGit)
* LinkedIn: [@mrzeapple](https://linkedin.com/in/mrzeapple)

## Show your support

Give a ⭐️ if this project helped you!
