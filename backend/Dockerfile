# Step 1: Use an official lightweight Node.js environment
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Step 4: Install only production dependencies (keeps the image tiny)
RUN npm ci --only=production

# Step 5: Copy the rest of your backend source code
COPY . .

# Step 6: Expose the port your Express app listens on
EXPOSE 5000

# Step 7: Start the server
CMD ["node", "server.js"]