YUI := ~/yuicompressor-2.4.8.jar

FILES := iplayer.min bjqs.min jquery.mCustomScrollbar.min

all: iplayer.lib.css

clean:
	rm -f $(FILES) iplayer.lib.css

%.min: %.css
	java -jar $(YUI) --type css --charset utf-8 --nomunge --preserve-semi --disable-optimizations $< -o $@


iplayer.lib.css: $(FILES)
	echo > $@
	for file in $(FILES); do \
		cat $$file >> $@; \
		echo >> $@; \
	done
