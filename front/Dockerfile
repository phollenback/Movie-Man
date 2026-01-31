# Build stage
FROM node:24-alpine AS build
WORKDIR /app

ARG REACT_APP_GIT_REPO=phollenback/Movie-Man
ARG REACT_APP_GIT_BRANCH=main
ENV REACT_APP_GIT_REPO=$REACT_APP_GIT_REPO
ENV REACT_APP_GIT_BRANCH=$REACT_APP_GIT_BRANCH

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/00-log-format.conf /etc/nginx/conf.d/00-log-format.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
