FROM nginx:alpine

ARG SWARLEHTAIRE_VERSION=0.1.0

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk add --no-cache curl unzip && \
	SWARLEHTAIRE_VERSION_US=$(echo "${SWARLEHTAIRE_VERSION}" | tr '.' '_') && \
	curl -fSL -o /tmp/swarlehtaire.zip "https://github.com/slmingol/swarlehtaire/releases/download/v${SWARLEHTAIRE_VERSION}/webapp-swarlehtaire-${SWARLEHTAIRE_VERSION_US}.zip" && \
	rm -rf /usr/share/nginx/html/* && \
	unzip -o /tmp/swarlehtaire.zip -d /usr/share/nginx/html && \
	rm -f /tmp/swarlehtaire.zip && \
	apk del curl unzip

EXPOSE 80

