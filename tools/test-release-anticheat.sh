#!/bin/sh
set -eu

tools=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
. "$tools/release-anticheat.sh"
work=$(mktemp -d /tmp/zigcho-ac-pair.XXXXXX)
trap 'rm -rf "$work"' EXIT HUP INT TERM
config=$work/config.ini
pair_root=$work/pairs
old=/opt/zigcho/private/anticheat/old/libzigcho_anticheat.so
new=/opt/zigcho/private/anticheat/new/libzigcho_anticheat.so
if ac_validate_module /tmp/untrusted.so 2>/dev/null; then exit 1; fi
if ac_validate_module /opt/zigcho/private/anticheat/../libzigcho_anticheat.so 2>/dev/null; then exit 1; fi
ac_validate_module() { [ -z "$1" ] || [ "$1" = "$old" ] || [ "$1" = "$new" ]; }
printf 'password=fixture-only\n anticheat_module_path = %s # old\nother=preserved\n' "$old" > "$config"
chmod 640 "$config"
owner_before=$(ls -ln "$config" | awk '{print $1, $3, $4}')
[ "$(ac_read_config)" = "$old" ]
ac_record_pair /opt/zigcho/releases/old "$old"
ac_record_pair /opt/zigcho/releases/new "$new"
[ "$(ac_read_pair /opt/zigcho/releases/old "$new")" = "$old" ]
if ac_record_pair /opt/zigcho/releases/old "$new" 2>/dev/null; then exit 1; fi
ac_set_config "$new"
[ "$(ac_read_config)" = "$new" ]
[ "$(ls -ln "$config" | awk '{print $1, $3, $4}')" = "$owner_before" ]
grep -q '^password=fixture-only$' "$config"
grep -q '^other=preserved$' "$config"
ac_set_config "$(ac_read_pair /opt/zigcho/releases/old "$new")"
[ "$(ac_read_config)" = "$old" ]
ac_set_config "$(ac_read_pair /opt/zigcho/releases/new "$old")"
[ "$(ac_read_config)" = "$new" ]
inode_before=$(ls -i "$config" | awk '{print $1}')
ac_set_config "$new"
[ "$(ls -i "$config" | awk '{print $1}')" = "$inode_before" ]
ac_set_config "$old"
if (
  trap 'status=$?; trap - EXIT; ac_set_config "$old"; exit "$status"' EXIT
  ac_set_config "$new"
  false
); then exit 1; fi
[ "$(ac_read_config)" = "$old" ]
ac_set_config "$new"
if (
  trap 'status=$?; trap - EXIT; ac_set_config "$new"; exit "$status"' EXIT
  ac_set_config "$old"
  false
); then exit 1; fi
[ "$(ac_read_config)" = "$new" ]
if (
  awk() { return 1; }
  ac_set_config "$old"
); then exit 1; fi
[ "$(ac_read_config)" = "$new" ]
[ "$(ls -ln "$config" | awk '{print $1, $3, $4}')" = "$owner_before" ]
ac_set_config ''
[ -z "$(ac_read_config)" ]
ac_record_pair /opt/zigcho/releases/disabled ''
[ -z "$(ac_read_pair /opt/zigcho/releases/disabled "$new")" ]
printf 'other=preserved\n' > "$config"
ac_set_config "$old"
[ "$(ac_read_config)" = "$old" ]
awk '
  /systemctl stop "\$service"/ { stopped=NR }
  /^ac_set_config "\$anticheat_module"/ { if (!stopped || NR < stopped) exit 1; applied=1 }
  END { if (!applied) exit 1 }
' "$tools/activate-release.sh"
grep -q 'ac_set_config "\$previous_anticheat"' "$tools/activate-release.sh"
grep -q 'ac_set_config "\$current_anticheat"' "$tools/rollback-release.sh"
echo 'anticheat release pairing fixture passed'
