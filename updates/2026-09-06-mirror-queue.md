# the mirror can move on

the worker was stuck downloading the same set, rejecting an old id inside one difficulty, then putting that set first again. a failed set now gets a saved retry delay so the rest of the queue can keep moving.

upstream maps that match the expected checksum use their canonical api ids. the original file stays untouched, and user-uploaded maps still have their own strict id checks.

the worker also stops downloading the whole archive back out of object storage immediately after storing it. it can move straight to the next set. service dependencies now stop and start the worker with the main server so it doesn't get left on an old build again.

storage now has a server-local way around the stalled direct connection. the route only catches zigcho's connections to the singapore storage addresses, and the address list refreshes automatically. maps, images, avatars and replays keep the original https connection and certificate checks. backups use the same outbound connection through their own optional proxy setting. the rest of the server stays on its normal route.
