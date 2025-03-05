#!/bin/bash
# scripts/pnpm-from-scratch.sh

rm -rf dist
rm -rf node_modules
pnpm store prune
pnpm install
pnpm fix:exports