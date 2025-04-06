# Этап сборки (builder)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Генерация клиента Prisma и сборка проекта
RUN npx prisma generate
RUN npm run build

# Этап продакшн
FROM node:20-alpine
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json для установки production зависимостей
COPY package*.json ./
RUN npm install --production

# Копируем скомпилированное приложение и необходимые файлы Prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Выполняем генерацию клиента Prisma в production-образе
RUN npx prisma generate

# Открываем нужный порт
EXPOSE 8080

# Команда для запуска приложения
CMD ["npm", "run", "start:prod"]
