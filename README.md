iplayer
=======

The free interactive HTML5 player.

To see a fully working exemple: http://videos.elysee.fr/jep2014/index.html


Information
--------------------------------------
iplayer is build over videojs.


Configuration options
--------------------------------------

iplayer is configured using a JSON :

- **pulsar**: configure the pulsar for your whole project.
- **general**: set the general options for your project.
- **hotspots**: set the interactive hotspots.
- **popups**: set the popups.
- **map**: set the map options.

`var iplayer_options = {pulsar: {...}, general: {...}, hotspots: [...], popups: [...], map: {...}};`

Configure "pulsar"
--------------------------------------

- **duration**: the length in ms for the pulsar animation, default is "3000".
- **maxWidth**: the maximum size in pixels for the pulsar, default is "40".
- **numberCircles**: the number of circles for the pulsar, default is "2".
- **borderColor**: the HTML color code for each circle's border color, default is "#000000".
- **borderSize**: the size in pixels for each circle's border, default is "2".
- **fillColor**: the HTML color code for each circle's fill color, default is "#ffffff".
- **image**: when SVG is not available, use the picture as a fallback, default is "/iplayer/images/circle-white.png".


Configure "general"
--------------------------------------

**general** is an object: `iplayer_options['general'] = {};`

- **name**: the name of your project.
- **width**: your wideo's width, this value is very important as it will be used to calculate the hotspots' position.
- **height**: your wideo's height, see **width**.
- **logo**: the log to display on iplayer's top bar.
- **logoLink**: the link associated with the **logo**.
- **autoplay**: should the video be ran automatically (doesn't work on iPad), default is "0".
- **shareLink**: when sharing on Twitter or Facebook, use this link. 
- **shareText**: the text used when sharing on Twitter or Facebook.
- **twitterVia**: add this twitter account as a "via" on the tweet, dont add the "@".
- **twitterHashtag**: add this hashtag on the tweet, dont add the "#".
- **ga**: a Google Analytics ID, iplayer will push Events that will allow you to track all events of your video.
- **lang**: set iplayer's lang, available is "fr" and "en", default is "en". 
- **hd**: if your current video is SD, the link to the HD player, default is "".
- **sd**: if your current video is HD, the link to the SD player, default is "".

Configure "hotspots"
--------------------------------------

The hotspots are the interactive point that will be displayed over your video, they can either target :
- an interal popup
- a position in your video
- a HTML link
- another iplayer video

**hotspots** is an array: `iplayer_options['hotspots'] = [];`

Each **hotspot** is an object, configured as follow:

- **name** the unique name of the hotspot.
- **startsAt** the time code in seconds to start displaying the hotspot.
- **endsAt** the time code in seconds to hide the hotspot.
- **moves** is array of each movement object the hotspot will have to follow:
	- **startsAt** the time code to start the movement at, in seconds.
	- **endsAt** the time code to end the movement at, in seconds.
	- **x1** the originating X position, relative to **general['width'].
	- **y1** the originating Y position, relative to **general['height'].
	- **x2** the destination X position, relative to **general['width'].
	- **y2** the destination Y position, relative to **general['height'].
- **target** the type of target, possible values:
	- **popup** for an internal popup.
	- **_blank** a new browser window.
	- **_top** the current top window.
	- **video** another ilpayer project, the return information will be automatically added.
	- **timecode** a time code in the current video.
- **link** the link, value depends on **target** value:
	- **target** is **popup**, the unique name of the popup.
	- **target** is **_blank**, an URL.
	- **target** is **_top**, an URL.
	- **target** is **video**, an URL to another iplayer project, both projects must be hosted on the same domain.
	- **target** is **timecode**, a time code in seconds to seek to.
- **tooltipVisible**, 1 or 0 to activate/deactivate the display of the tooltip.
- **tooltip** an optional text to display underneath the hotspot.
- **tooltipTime** the length in seconds to display the tooltip for.
- **image**, the type of pulsar to display:
	- **pulsar** to use the default pulsar configured for the whole project.
	- **an url** to dispay an image for this hotspot.

Configure "popups"
--------------------------------------

The popups are the contents that will be displayed over your video.

**popups** is an array: `iplayer_options['popups'] = [];`

Each **popup** is an object, configured as follow:

- **name** the unique name of the popup.
- **type** the type of content:
	- **mixed** the popup will be displayed in a two columns, see **leftType** for details on how to configure the **leftContent**
	- **html** the popup displays plain HTML.
	- **htmlVideo** the popup displays an HTML5 video.
	- **video** the popup displays an **iframe** video.
	- **slideshow** the popup displays a list of pictures as a slideshow.
	- **picture** the popup displays a single image.
- **leftType**, when **type** is **mixed** configures the type of content in the left pane:
	- **htmlVideo** the left pane displays an HTML5 video.
	- **video** the left pane displays an **iframe** video.
	- **slideshow** the left pane displays a list of pictures as a slideshow.
	- **picture** the left pane displays a single image.
- **leftContent**, when **type** is **mixed** configures the content in the left pane, value depends on **leftType**:
	- **leftType** is **htmlVideo**, an HTML code for an HTML5 video, like `<video class="video-js vjs-default-skin" controls preload="auto" width="960" height="540" poster="/jep2014\/jep2014/pictures/vid_hyperlapse_cour.jpg"><source src="/jep2014/jep2014/movies/vid_hyperlapse_cour.mp4" type="video/mp4" /></video>`.
	- **leftType** is **video**, an HTML code for a video **iframe**, **embed** or **object**.
	- **leftType** is **slideshow**, a list of images' URL, separated by a new line.
	- **picture** is **slideshow**, the URL to a single image.
- **rightContent** the HTML code to display on the right pane, ignored when **type** is not **mixed**.

Configure "map"
--------------------------------------

The map is a statefull container, optionally displayed during the video.

- **title** the text of the button to be displayed in the player header.
- **frames** the list of frames as an array, each frame is an object with the follwing members:
	- **startsAt** the time code when the frame is displayed and its associated hotspot is considered active.
	- **title** the title of the active frame.
	- **group** an unique name to asssociate a group of frames together, when a new group is displayed, all other groups are being hidden (if not specified, value is copied from previous frame).
	- **image** the URL to an image to display (if not specified, value is copied from previous frame).
	- **width** the width of the image (if not specified, value is copied from previous frame).
	- **height** the height of the image (if not specified, value is copied from previous frame).
	- **zoom** the zoom factor on the image.
	- **hotspot** an object defining the hotspot:
		- **x** the X coordinate to display the hotspot at, relative to **width**.
		- **y** the Y coordinate to display the hotspot at, relative to **height**.
		- **target** the type of target, possible values:
			- **_blank** a new browser window.
			- **_top** the current top window.
			- **video** another ilpayer project, the return information will be automatically added.
			- **timecode** a time code in the current video.
		- **link** the link, value depends on **target** value:
			- **target** is **_blank**, an URL.
			- **target** is **_top**, an URL.
			- **target** is **video**, an URL to another iplayer project, both projects must be hosted on the same domain.
			- **target** is **timecode**, a time code in seconds to seek to.
		- **borderColor**: the HTML color code for each circle's border color, default is "#000000" (if not specified, value is copied from previous frame).
		- **borderSize**: the size in pixels for each circle's border, default is "2" (if not specified, value is copied from previous frame).
		- **fillColor**: the HTML color code for each circle's fill color, default is "#ffffff" (if not specified, value is copied from previous frame).
		- **borderColor2**: when this is the current frame, the HTML color code for each circle's border color, default is "#ff0000" (if not specified, value is copied from previous frame).
		- **borderSize2**: when this is the current frame, the size in pixels for each circle's border, default is "2" (if not specified, value is copied from previous frame).
		- **fillColor2**: when this is the current frame, the HTML color code for each circle's fill color, default is "#ffffff" (if not specified, value is copied from previous frame).
		- **image1**: when SVG is not available, use the picture as a fallback, default is "/iplayer/images/circle-white.png" (if not specified, value is copied from previous frame).
		- **image2**: when this is the current frame, when SVG is not available, use the picture as a fallback, default is "/iplayer/images/circle-red.png" (if not specified, value is copied from previous frame).
