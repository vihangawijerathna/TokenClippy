FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 🔌 1. Tell Docker to expect the backend URL during build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 🏗️ 2. Build the app (Vite will grab the ENV variable above automatically)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]