# Use an official Node.js runtime
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the backend code into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
