# Music Downloader Project

## Summary

The Music Downloader allows the user to take streaming video files and convert them into audio files and then saving the audio file directly to a server location of the user's choice with the option to apply metadata.  The intent is to be able to get mp3 files off of streaming sites like Youtube from videos where that particular audio could not be found anywhere else, like live shows recordings.  Many sites already support this, but the difference here is that urls input will directly save to the server and can be managed with any server-side music software from there.  This runs it's own webserver using CherryPy.

The code is still a work in progress and currently only supports mp3 format and youtube videos.

## Requirements

- Python 2.7.3
- youtube-dl
- mp3info

## Setup

1. Install requirements on server
2. Download repo
3. Open configuration and change user_name, password, and port if you like.
4. Run downloader.py (you can run it directly using **python downloader.py** or turn it into a daemon using **nohup python downloader.py &*)
5. Open Web UI at **server.ip:8081** (or whatever port you changed it too)

## Usage

*Running the Web UI:* The Web UI is accessible through your server's IP plus the port you chose in the configuration file (default: 8081).  You'll be prompted for login and password, which is also set in the configuration file (default user/changeme).

*Downloading a Song:* Simply copy paste a streaming video url into one of the form input fields.  If you don't see any form input fields, press "+" at the top right, you can press this to add more fields in order to simultaneously download multiple songs.  Hit the "i" button next to the form and fill out the metadata.  The metadata is optional, but your file name settings may depend on certain fields being filled out to name them properly.  Once you have all the fields filled in.  Hit "Run Download".  Download and converting process may take a couple of minutes, form fields will turn green as they're completed.

## Configuration

Configuration can be done both through the web UI and server side.  The web UI has some error checking but does not have the full range of options that the configuration file has.  However most of those missing options are not ones you should be changing much anyways.  Web UI's configuration is found by clicking on the "=" button at the top left.

Web UI configuration options:

- **Download Path**: The path that the files will be downloaded to.  The path is checked against the server, and if it doesn't exist then it'll attempt to create it. (Corresponds to download_path in config file)
- **File Name Format**: The file name format of downloaded files.  It can be straight text, or use {Artist}, {Title}, and/or {Year} to pull data from the metadata for naming. (Corresponds to file_name in config file)
- **Change Spaces to Underscores**: Converts all spaces in the name to underscores if set to true.  (Corresponds to spaces_to_underscores in the config file)
- **Audio Format**: Picks which audio format the files should be saved at.  The options in the picklist are limited by the server's ability to process the formats.  (Corresponds to format in the config file)

The configuration file is located in **downloader.conf**

- **server.socket_host**: This limits what IP the server will listen to, 0.0.0.0 will accept connections from everywhere, where as 127.0.0.1 will only accept connections from localhost.  By default it is set to 0.0.0.0
- **server.socket_port**: The port the server will run off, and subsequently the one that will need to be entered with the url to access (unless it's set to 80).  By default it's 8081.
- **tools.sessions.on**: Designates whether or not to use sessions, is set to true by default.
- **tools.staticdir.root**: Finds the root of the folder, it gets it dynamically and should not be changed.
- **tools.staticdir.on**: Whether or not to use a static directory, is true by default and should not be changed.
- **tools.staticdir.dir**: Designates the name of the static directory with all the HTML/JS/CSS files.  By default it's "Static".
- **user_name**: User Name for server authentication, Change this when installing.
- **password**: Password for authentication, Change this when installing.
- **download_path**: The path from root that songs will be downloaded to by default.
- **file_name**: The format with which songs are named.  You can put in straight text, or use {Artist}, {Title}, and/or {Year} to pull data from your input metadata.
- **format**: The format with which the file is saved, by default it's "Mp3".  Please note that only a limited amount of formats are available.
- **spaces_to_underscores**: A checkboxes that desginates whether spaces should be converted to underscores in the name.  This is particularly useful in conjuction with dynamic naming, if you want to avoid spaces in file names.  Set to false by default.