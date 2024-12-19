# Используем образ Node.js версии 16 в качестве базового
FROM node:22-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости приложения
RUN npm install

# Копируем весь код приложения
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Открываем порт, по которому будет доступно приложение (например, порт 3000)
EXPOSE 3010

# Запускаем приложение с помощью npm
CMD [ "npm", "start" ]
