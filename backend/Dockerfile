# =============================================================================
# FILE: backend/Dockerfile
# PURPOSE: Instructions to build a Docker image for the Flask backend
# =============================================================================

# -----------------------------------------------------------------------------
# STEP 1: BASE IMAGE
# -----------------------------------------------------------------------------
# FROM specifies the starting point for our image
# python:3.11-slim is a minimal Python image (smaller = faster builds)
# -slim means it doesn't include unnecessary packages
FROM python:3.11-slim

# -----------------------------------------------------------------------------
# STEP 2: SET WORKING DIRECTORY
# -----------------------------------------------------------------------------
# WORKDIR creates the directory and sets it as current
# All subsequent commands run from this directory
WORKDIR /app

# -----------------------------------------------------------------------------
# STEP 3: COPY REQUIREMENTS FIRST
# -----------------------------------------------------------------------------
# Docker caches each step (layer). By copying requirements.txt first,
# the dependency installation step is cached.
# Only re-runs if requirements.txt changes (not when code changes)
COPY requirements.txt .

# -----------------------------------------------------------------------------
# STEP 4: INSTALL DEPENDENCIES
# -----------------------------------------------------------------------------
# RUN executes a command during image build
# --no-cache-dir: Don't cache pip downloads (smaller image)
RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------------------------------------------------------
# STEP 5: COPY APPLICATION CODE
# -----------------------------------------------------------------------------
# COPY source destination
# . means current directory (everything in backend/)
# . means copy to WORKDIR (/app)
COPY . .

# -----------------------------------------------------------------------------
# STEP 6: EXPOSE PORT
# -----------------------------------------------------------------------------
# EXPOSE documents which port the container listens on
# This is informational - you still need -p flag when running
EXPOSE 5000

# -----------------------------------------------------------------------------
# STEP 7: START COMMAND
# -----------------------------------------------------------------------------
# CMD specifies what runs when the container starts
# Only one CMD per Dockerfile (last one wins)
CMD ["python", "app.py"]