# web replay pp and a cleaner skin

the replay counter follows the play now, not just the pp it finished with. it
uses the hits, misses and combo reached at that point, and going backwards
restores the earlier value instead of keeping the end result on screen.

this runs our existing calculators in the browser. Stable, lazer, Relax and AP
keep their own calculation paths, including custom rates and the current Relax
balance. no saved pp or server scoring changes here. if the calculator cannot
load, it says so rather than pretending the final total is a live counter.

the playback skin is cleaner too: dark sliders, finer circles, readable numbers
and a small yellow cursor instead of that massive glow. the spinner still
works, and the audio, seeking and playback speed controls stay where they were.
