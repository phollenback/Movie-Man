# Build stage
FROM node:24-alpine AS build
WORKDIR /app

ARG REACT_APP_GIT_REPO=phollenback/Movie-Man
ARG REACT_APP_GIT_BRANCH=main
ARG REACT_APP_ENTRA_CLIENT_ID
ARG REACT_APP_ENTRA_TENANT_ID=common
ARG REACT_APP_REDIRECT_URI=https://movieman.azurewebsites.net
ARG REACT_APP_OMDB_API_KEY
ARG REACT_APP_API_URL=https://movieman-api.azurewebsites.net/api
ENV REACT_APP_GIT_REPO=$REACT_APP_GIT_REPO
ENV REACT_APP_GIT_BRANCH=$REACT_APP_GIT_BRANCH
ENV REACT_APP_ENTRA_CLIENT_ID=$REACT_APP_ENTRA_CLIENT_ID
ENV REACT_APP_ENTRA_TENANT_ID=$REACT_APP_ENTRA_TENANT_ID
ENV REACT_APP_REDIRECT_URI=$REACT_APP_REDIRECT_URI
ENV REACT_APP_OMDB_API_KEY=$REACT_APP_OMDB_API_KEY
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package.json package-lock.json* ./
RUN npm install

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
