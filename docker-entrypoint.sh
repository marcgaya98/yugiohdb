#!/bin/sh
# docker-entrypoint.sh

# Esperar a que MySQL esté listo
echo "Esperando a que MySQL esté disponible..."
/usr/src/app/wait-for-mysql.sh db

# Iniciar la aplicación
echo "Iniciando la aplicación..."
exec "$@"
