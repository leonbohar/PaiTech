#!/usr/bin/env bash
# Downloads the original page images from the Framer CDN into assets/img/,
# so the site no longer depends on the old Framer project.
set -euo pipefail
cd "$(dirname "$0")/../public/assets/img"
for f in XKVnwT84Tp5R3MBpyh79osMOM.jpg se8VAogWXL13pgtW8quzGnJ5m0.jpg n6Sf7gLS57sMJZ850JuGApT3Oo.jpg iNO7Qjfh9I6ufP5E8s48obcM.png; do
  curl -fsSL -o "$f" "https://framerusercontent.com/images/$f"
  echo "saved $f"
done
