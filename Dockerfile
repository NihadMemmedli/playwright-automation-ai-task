# Pinned to a Playwright image whose browsers match the @playwright/test version in package.json.
# Update both together when bumping Playwright.
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy the rest of the project
COPY . .

# Generate fixtures during image build so containers run offline-friendly
RUN node scripts/prepare-test-data.mjs

# Default to running the full suite. Override with: docker run ... npm run test:chromium
CMD ["npm", "test"]
