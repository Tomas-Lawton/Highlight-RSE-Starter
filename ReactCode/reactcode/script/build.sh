#!/bin/bash

build() {
    echo 'building react'

    rm -rf build/*
    
    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    react-scripts build

    mkdir -p build
    mv build/index.html build/popup.html

}

build