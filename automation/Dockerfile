FROM python:3.12-slim

# Install git, bash, curl, and essential tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        bash \
        curl \
        ca-certificates \
        openssh-client && \
    rm -rf /var/lib/apt/lists/*

# Set up workdir
WORKDIR /automation

# Copy automation scripts
COPY scripts/ /automation/scripts/
RUN chmod +x /automation/scripts/*.sh /automation/scripts/*.py

# Set workspace environment variable
ENV WORKSPACE_DIR=/automation/workspace
ENV PYTHONUNBUFFERED=1

# Default entrypoint
ENTRYPOINT ["/automation/scripts/run_automation.sh"]
CMD ["sync"]
