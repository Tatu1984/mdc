FROM quay.io/keycloak/keycloak:23.0

WORKDIR /opt/keycloak

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--proxy=edge", "--hostname-strict=false", "--http-enabled=true"]
