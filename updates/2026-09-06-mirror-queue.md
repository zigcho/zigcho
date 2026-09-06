# the mirror can move on

the worker was stuck downloading the same set, rejecting an old id inside one difficulty, then putting that set first again. a failed set now gets a saved retry delay so the rest of the queue can keep moving.

upstream maps that match the expected checksum use their canonical api ids. the original file stays untouched, and user-uploaded maps still have their own strict id checks.

the worker also stops downloading the whole archive back out of object storage immediately after storing it. it can move straight to the next set. service dependencies now stop and start the worker with the main server so it doesn't get left on an old build again.

storage can now use a local proxy without sending the rest of the server through it. maps, images, avatars, replays and backups keep their normal storage identity and tls checks, but can take a working outbound connection when the direct one keeps stalling. the proxy is optional and off by default.
