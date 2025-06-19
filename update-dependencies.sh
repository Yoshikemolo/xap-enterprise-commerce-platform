#!/bin/bash

echo "========================================="
echo " Enterprise Commerce Platform"
echo " Dependency Update Script"
echo "========================================="
echo

echo "[1/4] Cleaning npm cache..."
npm cache clean --force

echo
echo "[2/4] Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo
echo "[3/4] Installing dependencies with Angular 19 + PrimeNG 19 + Zone.js 0.15 + Nx 20..."
npm install

echo
echo "[4/4] Verifying installation..."
npm ls

echo
echo "========================================="
echo " Update completed successfully!"
echo " Angular 19 + PrimeNG 19.1.0 + Zone.js 0.15 + Nx 20.5"
echo "========================================="
echo
echo "To start development:"
echo "  npm run dev"
echo
