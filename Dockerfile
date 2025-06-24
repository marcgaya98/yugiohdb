FROM node:20-alpine as base

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Instalar dependencias del sistema incluyendo MySQL client
RUN apk add --no-cache mysql-client

# Instalar las dependencias
COPY package*.json ./
RUN npm ci

# Build para producción
FROM base as production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD ["node", "app.js"]

# Build para desarrollo
FROM base as development
RUN npm install -g nodemon
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD ["nodemon", "--experimental-json-modules", "app.js"]
