#!/bin/bash

npm i &> /dev/null

CAVAR=$(ts-node "./get-ca-file")
if [ "$CAVAR" != "null" ]
then
    export NODE_EXTRA_CA_CERTS=$CAVAR
fi

ts-node "./src/main"
