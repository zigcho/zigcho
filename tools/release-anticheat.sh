#!/bin/sh

ac_validate_module() (
  [ -n "$1" ] || exit 0
  printf '%s\n' "$1" | grep -Eq '^/opt/zigcho/private/anticheat/[A-Za-z0-9_-][A-Za-z0-9._-]*/libzigcho_anticheat\.so$' || {
    echo "anticheat module must use an immutable private release" >&2; exit 1;
  }
  [ -f "$1" ] && [ -r "$1" ] && [ "$(readlink -f "$1")" = "$1" ] || {
    echo "anticheat module is missing or resolves through a symlink" >&2; exit 1;
  }
)

ac_read_config() {
  [ -f "$config" ] || return 0
  sed -n 's/^[[:space:]]*anticheat_module_path[[:space:]]*=[[:space:]]*\([^#]*\).*$/\1/p' "$config" | tail -n 1 | sed 's/[[:space:]]*$//'
}

ac_set_config() (
  ac_validate_module "$1" || exit 1
  [ "$(ac_read_config)" != "$1" ] || exit 0
  [ -f "$config" ] && [ ! -L "$config" ] || { echo "anticheat config is missing or symlinked" >&2; exit 1; }
  ac_tmp=$(mktemp "$config.ac.XXXXXX")
  trap 'rm -f "$ac_tmp"' EXIT HUP INT TERM
  cp -p "$config" "$ac_tmp" || exit 1
  awk -v module="$1" '
    /^[[:space:]]*anticheat_module_path[[:space:]]*=/ { print "anticheat_module_path=" module; found=1; next }
    { print }
    END { if (!found) print "anticheat_module_path=" module }
  ' "$config" > "$ac_tmp" || exit 1
  mv -f "$ac_tmp" "$config" || exit 1
)

ac_pair_path() {
  ac_key=$(printf '%s' "$1" | sha256sum | cut -d ' ' -f1)
  printf '%s/%s.module\n' "$pair_root" "$ac_key"
}

ac_record_pair() (
  ac_validate_module "$2" || exit 1
  [ ! -L "$pair_root" ] || { echo "release pair directory is symlinked" >&2; exit 1; }
  install -d -m 0700 "$pair_root" || exit 1
  ac_path=$(ac_pair_path "$1")
  if [ -e "$ac_path" ]; then
    [ "$(sed -n '1p' "$ac_path")" = "$1" ] && [ "$(sed -n '2p' "$ac_path")" = "$2" ] && [ "$(wc -l < "$ac_path" | tr -d ' ')" = 2 ] || {
      echo "release already has a different anticheat pair" >&2; exit 1;
    }
    exit 0
  fi
  ac_tmp=$(mktemp "$pair_root/.pair.XXXXXX")
  trap 'rm -f "$ac_tmp"' EXIT HUP INT TERM
  printf '%s\n%s\n' "$1" "$2" > "$ac_tmp" || exit 1
  mv -f "$ac_tmp" "$ac_path" || exit 1
)

ac_read_pair() (
  ac_path=$(ac_pair_path "$1")
  if [ ! -f "$ac_path" ]; then
    printf '%s\n' "$2"
    exit 0
  fi
  [ "$(sed -n '1p' "$ac_path")" = "$1" ] && [ "$(wc -l < "$ac_path" | tr -d ' ')" = 2 ] || {
    echo "invalid anticheat release pairing" >&2; exit 1;
  }
  ac_module=$(sed -n '2p' "$ac_path")
  ac_validate_module "$ac_module" || exit 1
  printf '%s\n' "$ac_module"
)
