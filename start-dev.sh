#!/bin/bash

export NODE_ENV=development

node "./src/install-dependencies"

CAVAR=$(ts-node "./get-ca-file")
if [ "$CAVAR" != "null" ]
then
    export NODE_EXTRA_CA_CERTS=$CAVAR
fi

ts-node "./make-doc"
ts-node "./src/main"
