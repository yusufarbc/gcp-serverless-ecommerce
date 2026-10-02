# Server-Side Google Tag Manager (sGTM) Container
# Official Google Cloud Tagging base image
FROM gcr.io/cloud-tagging-102307/gtm-cloud-image:stable

# Port 8080 is the default port for Cloud Run
ENV PORT=8080

# Health check endpoint provided by sGTM (/healthz)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

# Run as non-root user (nobody:nogroup)
USER 65534:65534

EXPOSE 8080
