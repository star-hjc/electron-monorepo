#!/bin/bash
rm -rf dist

wasm-pack build \
  --release \
  --out-dir ./dist \
  --out-name index \
  --target web