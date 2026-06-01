# --- STAGE 1: Build the React App ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Compiles your React/Vite app into a production-ready /dist folder
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the compiled static assets from Stage 1 into Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for regular web traffic
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]