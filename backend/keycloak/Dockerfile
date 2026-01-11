FROM quay.io/keycloak/keycloak:23.0

WORKDIR /opt/keycloak

# Railway provides PORT env variable
ENV KC_HTTP_PORT=${PORT:-8080}
ENV KC_HOSTNAME_STRICT=false
ENV KC_HOSTNAME_STRICT_HTTPS=false
ENV KC_HTTP_ENABLED=true

EXPOSE ${PORT:-8080}

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev"]
