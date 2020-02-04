#!/bin/bash

export NODE_ENV=development

node "./lib/install-dependencies"

CAVAR=$(ts-node "./lib/get-ca-file")
if [ "$CAVAR" != "null" ]
then
    export NODE_EXTRA_CA_CERTS=$CAVAR
fi

ts-node "./make-doc"
ts-node "./lib/main"
