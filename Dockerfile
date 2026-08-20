FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy application files
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]