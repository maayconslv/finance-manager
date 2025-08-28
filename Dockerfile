FROM node:20-slim

RUN apt-get update && apt-get install -y bash git openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY deploy.sh .

RUN npx prisma generate
RUN npm run build
RUN chmod +x deploy.sh

EXPOSE 3000

CMD ["./deploy.sh"]