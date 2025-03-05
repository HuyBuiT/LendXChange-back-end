#!/bin/bash
# scripts/fix-all-exports.sh

node scripts/fix-exports.js node_modules/@elizaos/adapter-postgres
node scripts/fix-exports.js node_modules/@elizaos/adapter-sqlite
node scripts/fix-exports.js node_modules/@elizaos/client-direct
node scripts/fix-exports.js node_modules/@elizaos/core
node scripts/fix-exports.js node_modules/@elizaos/plugin-bootstrap