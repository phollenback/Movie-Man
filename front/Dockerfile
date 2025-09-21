FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first
COPY package*.json ./

# Install deps
RUN npm install

# Copy app source
COPY . .

# Expose the default React dev server port
EXPOSE 5173

# Start the dev server (CRA uses 3000, Vite uses 5173)
CMD ["npm", "run", "dev"]
