# escape=`
FROM hub.nexdev.net/base/nginxinc/nginx-unprivileged

USER nginx

WORKDIR /app

# Copy files
COPY assets /usr/share/nginx/html