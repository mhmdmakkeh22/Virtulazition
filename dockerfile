# 1) Image Node LTS
FROM node:18

# 2) Dossier de travail
WORKDIR /app

# 3) Copier manifests
COPY package*.json ./

# 4) Installer les dépendances
RUN npm install

# 5) Copier le code source
COPY . .

# 6) Build TypeScript
RUN npm run build

# 7) Exposer le port du serveur
EXPOSE 3000

# 8) Démarrer l'appli
CMD ["npm", "start"]