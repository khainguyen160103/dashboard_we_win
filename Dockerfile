# ==============================================
# STAGE 1: Build React/Vite app
# ==============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files trước để tận dụng Docker layer cache
COPY package.json package-lock.json ./

# Cài dependencies
RUN npm ci --silent

# Copy toàn bộ source code
COPY . .

# Nhận biến môi trường từ docker-compose build args
# QUAN TRỌNG: Vite bakes biến này vào JS bundle lúc build
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build production
RUN npm run build

# ==============================================
# STAGE 2: Serve bằng Nginx Alpine (nhỏ ~25MB)
# ==============================================
FROM nginx:alpine

# Xoá config mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy config Nginx từ project
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files đã build từ Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
