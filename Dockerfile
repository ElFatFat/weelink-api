FROM node:22-alpine

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Clean any existing modules and install dependencies 
RUN npm ci

# Copy project files
COPY . .

# Remove any host-compiled bcrypt and rebuild
RUN rm -rf node_modules/bcrypt && npm install bcrypt --build-from-source

# Create logs directory
RUN mkdir -p logs

# Expose the application port
EXPOSE 3001

# Default command
CMD ["npm", "start"]