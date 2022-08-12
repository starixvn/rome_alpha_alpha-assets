# Use nginx-unprivileged image
FROM hub.nexdev.net/base/nginxinc/nginx-unprivileged

# Register TRANSFORM_CONFIG argument for transforming by environment
ARG TRANSFORM_CONFIG

# Set working directory
WORKDIR /app

# Copy files/folders to working directory
COPY assets assets

# Set root user has full permissions of read/write files/folders to copy needed things
USER root

# Copy needed files/folders
RUN cp -r assets/styles/ /usr/share/nginx/html/styles

RUN if [ "$TRANSFORM_CONFIG" = "LOCAL2" ] \
		|| [ "$TRANSFORM_CONFIG" = "SIT2" ] \
		|| [ "$TRANSFORM_CONFIG" = "UAT2" ] \
		|| [ "$TRANSFORM_CONFIG" = "PRO2" ] \
		|| [ "$TRANSFORM_CONFIG" = "AWS2" ] \
		|| [ "$TRANSFORM_CONFIG" = "NAPAWS2" ] \
		|| [ "$TRANSFORM_CONFIG" = "NAPINTERNAL2" ] \
		|| [ "$TRANSFORM_CONFIG" = "MNL2" ] \
		|| [ "$TRANSFORM_CONFIG" = "MNLNAP2" ]; \
	then cp -r assets/bundles2/ /usr/share/nginx/html/bundles; \
	else cp -r assets/bundles/ /usr/share/nginx/html/bundles; fi

# Set non root user nginx
USER nginx