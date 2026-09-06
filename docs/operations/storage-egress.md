# storage egress

the application keeps its normal HTTPS implementation. `deploy/storage-egress.nft` redirects only connections owned by the `zigcho` user, addressed to the Singapore storage IPs on TCP 443. it owns one table and never flushes the system ruleset. other services, SSH and unrelated outbound traffic are untouched.

the loopback relay on port 40001 establishes a CONNECT tunnel through WARP on port 40000. it forwards encrypted bytes, not decrypted HTTP. the original S3 hostname, certificate checks and request signatures stay unchanged. the relay has a 64-connection ceiling and a five-minute idle timeout.

install `tools/storage-egress.sh` and `deploy/storage-egress.nft` under `/opt/zigcho/network/`, plus the storage egress, relay, route and DNS systemd units. the DNS timer refreshes the destination set every five minutes. refreshes replace the set atomically; a failed lookup keeps the existing addresses. stop `zigcho-storage-route.service` to remove only this route and return to direct connections.

`object_storage_proxy_port=40000` is for the operational backup script, which runs outside the `zigcho` user. `0` disables that optional backup proxy. it is not an application HTTP-client proxy setting.

the live setup uses Cloudflare WARP in local proxy mode on `127.0.0.1:40000`. this is not full-device WARP: SSH, Layerline and player connections keep their normal route. do not turn on full-device mode to reproduce this setup.

`deploy/systemd/zigcho-storage-egress.service` runs a pinned headless copy of the official client. the binaries are not in this repository. the current unit expects version `2026.7.1377.0` under `/opt/zigcho/network/warp-2026.7.1377.0`; its official noble amd64 package SHA256 is `a73429701c47ee9dc3c8307a0ead67054530787239bd71a12e7f93acdbe96f65`. only `bin/warp-svc` and `bin/warp-cli` are extracted. the private library directory contains Ubuntu's `libtss2-tctildr.so.0` dependency. no desktop package hooks are run.

the relay uses Ubuntu's socat `1.8.0.0-4ubuntu0.1`, extracted under `/opt/zigcho/network/socat-1.8.0.0`, and runs as its own dynamic user. it is not the `zigcho` user, so its connection to the proxy cannot feed back into the storage redirect.

before enabling storage traffic, register the client, set `mode proxy`, set `proxy port 40000`, and connect. confirm both listeners are loopback-only, a proxy test reports `warp=on`, a complete public mirror download matches its expected hash, and the server's normal route is unchanged. use the installed `warp-cli --help` for the exact commands. the service keeps its registration under `/var/lib/cloudflare-warp`; that directory is private and must never go into Git or a support attachment.

start and verify the egress service and relay before enabling the route. keep them independent of server restarts, and order the game service after the route on hosts using this setup. if the proxy fails while the route is active, storage requests fail rather than silently switching back to the stalled direct path. stop or disable the relay and egress service only after removing the route and disabling the backup proxy.

this works around the measured direct-path retransmission stalls. it does not claim to repair the underlying transit fault. keep a rollback build and verify downloads through the public mirror after any change.
