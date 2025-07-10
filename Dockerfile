FROM node:18-alpine

WORKDIR /app

COPY dist ./dist
COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/main"]
