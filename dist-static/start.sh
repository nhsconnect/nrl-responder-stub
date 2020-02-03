#!/bin/bash

export NODE_ENV=production

node "./src/install-dependencies"

CAVAR=$(node "./get-ca-file")
if [ "$CAVAR" != "null" ]
then
    export NODE_EXTRA_CA_CERTS=$CAVAR
fi

node "./src/main"
