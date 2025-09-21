# front/Dockerfile
FROM node:24-alpine
WORKDIR /app

# Copy manifests; lockfile is optional (the * allows zero matches)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
