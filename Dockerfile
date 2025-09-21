# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /app

# copy manifests first for caching
COPY front/package*.json ./
RUN npm install

# copy source and build
COPY front/ .
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine
# CRA outputs to /app/build (not dist)
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
