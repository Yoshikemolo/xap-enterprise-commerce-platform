#!/bin/bash

echo "🧹 Limpiando cache de Nx y reinstalando dependencias..."

echo ""
echo "📁 Eliminando directorios de cache..."
rm -rf .nx
rm -rf node_modules/.cache  
rm -rf dist

echo ""
echo "🔄 Reinstalando dependencias..."
npm install

echo ""
echo "✅ Verificando configuracion de proyectos..."
npx nx show projects

echo ""
echo "🚀 Configuracion completada. Ahora puedes ejecutar:"
echo "   npm run dev:ready  (para servicios MVP completos)"
echo "   npm run dev:all    (para todos los servicios incluidos stubs)"
