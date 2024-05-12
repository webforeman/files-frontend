# Указывается базовый образ для этапа сборки
# ---- Build Stage ----
FROM node:20-alpine AS build

# Устанавливается рабочая директория в контейнере
WORKDIR /usr/src/app

# Копируются файлы package.json и package-lock.json в рабочую директорию
COPY package*.json .

# Выполняется установка всех зависимостей, включая зависимости для разработки
RUN npm install

# Копируется весь проект в рабочую директорию
COPY . .

# Запускается скрипт сборки проекта
RUN npm run build

# Указывается базовый образ для этапа продакшена
# ---- Runtime Stage ----
FROM node:20-alpine AS production

# Устанавливается рабочая директория в контейнере
WORKDIR /usr/src/app

# Копируются файлы package.json и package-lock.json в рабочую директорию
COPY package*.json .

# Выполняется установка только production зависимостей и очистка кэша npm
RUN npm ci --only=production && \
    npm cache clean --force

# Установка serve для изолированного запуска приложения
RUN npm install -g serve

# Копируется собранный код из этапа сборки в рабочую директорию этапа продакшена
COPY --from=build /usr/src/app/dist ./dist

# Может быть задана команда, которая будет выполнена при запуске контейнера
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
