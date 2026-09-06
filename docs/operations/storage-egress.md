# storage egress

`object_storage_proxy_port=0` keeps direct storage connections. set it to a loopback HTTP CONNECT proxy port to move only the configured object store onto another outbound path. the S3 endpoint, request signatures and end-to-end TLS checks do not change. the server and mirror worker need restarting after changing this setting. the backup transfer script reads it for each run.

the live setup uses Cloudflare WARP in local proxy mode on `127.0.0.1:40000`. this is not full-device WARP: SSH, Layerline and player connections keep their normal route. do not turn on full-device mode to reproduce this setup.

`deploy/systemd/zigcho-storage-egress.service` runs a pinned headless copy of the official client. the binaries are not in this repository. the current unit expects version `2026.7.1377.0` under `/opt/zigcho/network/warp-2026.7.1377.0`; its official noble amd64 package SHA256 is `a73429701c47ee9dc3c8307a0ead67054530787239bd71a12e7f93acdbe96f65`. only `bin/warp-svc` and `bin/warp-cli` are extracted. the private library directory contains Ubuntu's `libtss2-tctildr.so.0` dependency. no desktop package hooks are run.

before enabling storage traffic, register the client, set `mode proxy`, set `proxy port 40000`, and connect. confirm the listener is loopback-only, a proxy test reports `warp=on`, a complete stored file matches its expected hash, and the server's normal route is unchanged. use the installed `warp-cli --help` for the exact commands. the service keeps its registration under `/var/lib/cloudflare-warp`; that directory is private and must never go into Git or a support attachment.

start and verify the egress service before activating a server configured to use it. it stays independent of server restarts. if it fails, storage requests fail rather than silently switching back to the stalled direct path. to return to direct connections, set the port to `0` and restart the server and worker. stop or disable the egress service only after nothing depends on it.

this works around the measured direct-path retransmission stalls. it does not claim to repair the underlying transit fault. keep a rollback build and verify downloads through the public mirror after any change.
