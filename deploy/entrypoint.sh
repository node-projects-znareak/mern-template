#!/bin/sh
set -e

# Railway inyecta PORT con el puerto público del contenedor; nginx escucha ahí.
# La API corre en el 5000 interno (ver supervisord.conf).
export APP_PORT="${PORT:-8080}"

envsubst '${APP_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/http.d/default.conf

exec supervisord -c /etc/supervisord.conf
