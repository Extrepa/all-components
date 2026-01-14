#!/usr/bin/env bash
set -euo pipefail

ROOTS=("/Users/extrepa/Projects" "/Users/extrepa/Desktop/Android 69 - Jan 2027/ErrlProjects")
DEST_ROOT="/Users/extrepa/Projects/all-components"

EXCLUDES=(
  "--exclude=node_modules"
  "--exclude=.git"
  "--exclude=dist"
  "--exclude=build"
  "--exclude=.next"
  "--exclude=.cache"
  "--exclude=.npm-cache"
  "--exclude=.DS_Store"
)

EXCLUDE_PROJECTS=("all-components" "errl-portal" "errl-portal-shared" ".DS_Store")

should_exclude_project() {
  local name="$1"
  for ex in "${EXCLUDE_PROJECTS[@]}"; do
    if [[ "$name" == "$ex" ]]; then
      return 0
    fi
  done
  return 1
}

for root in "${ROOTS[@]}"; do
  if [[ ! -d "$root" ]]; then
    echo "Skipping missing root: $root"
    continue
  fi

  while IFS= read -r -d '' dir; do
    name="$(basename "$dir")"
    if should_exclude_project "$name"; then
      continue
    fi

    dest="$DEST_ROOT/$name"
    mkdir -p "$dest"

    echo "Copying $dir -> $dest"
    rsync -a "${EXCLUDES[@]}" "$dir/" "$dest/"
  done < <(find "$root" -mindepth 1 -maxdepth 1 -type d -print0)

done

