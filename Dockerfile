# Этап сборки (builder)
FROM node:16-alpine AS builder
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
FROM node:16-alpine
WORKDIR /usr/src/app

# Копируем все файлы из builder-этапа
COPY --from=builder /usr/src/app ./

# Открываем нужный порт (укажите нужный порт, например 3000)
EXPOSE 8080

# Команда для запуска приложения в режиме продакшн
CMD ["npm", "run", "start:prod"]
