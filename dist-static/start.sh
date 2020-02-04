#!/bin/bash

export NODE_ENV=production

node "./lib/install-dependencies"

CAVAR=$(node "./lib/get-ca-file")
if [ "$CAVAR" != "null" ]
then
    export NODE_EXTRA_CA_CERTS=$CAVAR
fi

node "./lib/main"
