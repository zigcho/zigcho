#!/bin/sh
set -eu

mode=${1:-}
table=zigcho_storage_egress
rules=/opt/zigcho/network/storage-egress.nft

case "$mode" in
  stop)
    if nft list table ip "$table" >/dev/null 2>&1; then nft delete table ip "$table"; fi
    exit 0
    ;;
  start|refresh) ;;
  *) echo 'usage: storage-egress.sh start|refresh|stop' >&2; exit 1;;
esac

addresses=$(getent ahostsv4 sin1.contabostorage.com | awk '{print $1}' | sort -u)
[ -n "$addresses" ] || { echo 'storage DNS lookup failed; existing route retained' >&2; exit 1; }
count=0
elements=
for address in $addresses; do
  case "$address" in *[!0-9.]*|'') exit 1;; esac
  count=$((count + 1))
  [ "$count" -le 8 ] || exit 1
  if [ -n "$elements" ]; then elements="$elements, $address"; else elements=$address; fi
done

if [ "$mode" = start ] && ! nft list table ip "$table" >/dev/null 2>&1; then
  [ -s "$rules" ] || { echo 'storage route rules missing' >&2; exit 1; }
  sed "s/elements = {[^}]*}/elements = { $elements }/" "$rules" | nft -f -
else
  printf 'flush set ip %s upstream\nadd element ip %s upstream { %s }\n' "$table" "$table" "$elements" | nft -f -
fi
