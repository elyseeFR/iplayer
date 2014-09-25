YUI := ~/yuicompressor-2.4.8.jar

FILES := site.min iplayer.min hotspot.min pulsar.min popup.min navigation.min map.min finalPopup.min lib/jquery.quickfit.min lib/jquery.ui.touch-punch.min lib/ios-orientationchange-fix.min

all: iplayer.lib.js

clean:
	rm -f $(FILES) iplayer.lib.js

%.min: %.js
	java -jar $(YUI) --type js --charset utf-8 --nomunge --preserve-semi --disable-optimizations $< -o $@


iplayer.lib.js: $(FILES)
	echo > $@
	for file in $(FILES); do \
		cat $$file >> $@; \
		echo ';' >> $@; \
	done
