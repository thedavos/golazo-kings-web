#!/bin/bash

# Obtiene el directorio donde se encuentra este script para que las rutas funcionen sin importar desde dónde se ejecute.
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Define el directorio de destino relativo a la ubicación del script.
# Sube un nivel (desde 'scripts') y luego entra en 'src/assets'.
TARGET_ASSETS_DIR="$SCRIPT_DIR/../src/assets"
TARGET_CSS_DIR="$SCRIPT_DIR/../src/css"

FILE="$TARGET_CSS_DIR/font.css"
FONT_FOLDER="$TARGET_ASSETS_DIR/web-font"

AGENT_WOFF="Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
#AGENT_WOFF2="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"

# download css as IE11 for .woff
wget https://fonts.googleapis.com/css?family=Manrope:300,400,500,600,700 -O - --header="User-Agent: ${AGENT_WOFF}" | \
  sed "s/local('.*'), //" > "$FILE"

# get links dirname
URL=$(cat $FILE | tr '()' \\n | grep https\*:// | head -n 1)
DIRNAME=$(dirname $URL)

rm -rf "$FONT_FOLDER"
mkdir "$FONT_FOLDER"

# download all http links
cat $FILE | tr '()' \\n | grep https\*:// | parallel --gnu "wget {} -P $FONT_FOLDER"

# replace links to local
sed -e "s*"$DIRNAME"*\./web-font*" $FILE > $FILE".tmp" && mv $FILE".tmp" $FILE
