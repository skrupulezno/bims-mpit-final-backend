# Этап сборки (builder)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
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

# Копируем только необходимые файлы для запуска
COPY package*.json ./
# Устанавливаем только production зависимости
RUN npm install --production

# Копируем скомпилированное приложение и, если требуется, папку с миграциями или конфигурацией Prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Если используются переменные окружения, не забудьте добавить файл .env
# COPY .env .env

# Открываем нужный порт
EXPOSE 8080

# Команда для запуска приложения в режиме продакшн
CMD ["npm", "run", "start:prod"]
