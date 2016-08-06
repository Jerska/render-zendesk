#! /bin/bash

# Exit on error
set -e

app_name="$1"
if [[  -z  $app_name  ]]; then
  echo "app_name required"
  exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

rm -rf "images/$app_name"
mkdir -p "images/$app_name"

phantomjs index.js "$app_name" >/dev/null 2>&1

mkdir -p gifs
gif_path=gifs/$app_name.gif
convert -layers Optimize -delay 15 -loop 0 `find images/$app_name -name "*.png" | sort` $gif_path
size=`ls -lh $gif_path | awk '{print $5}'`
echo $gif_path: $size
