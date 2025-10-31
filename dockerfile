# -------- ÉTAPE 1 : BUILD --------
FROM node:18 AS builder

# Dossier de travail
WORKDIR /app

# Copier les fichiers de configuration et installer les dépendances complètes (y compris dev)
COPY package*.json ./
RUN npm install

# Copier le code source et compiler TypeScript
COPY . .
RUN npm run build

#.......
#....
# -------- ÉTAPE 2 : RUNTIME (IMAGE FINALE) --------
FROM node:18-slim AS runtime

# Dossier de travail dans l'image finale
WORKDIR /app

# Copier uniquement le résultat de build et les fichiers nécessaires à l'exécution
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Copier uniquement le dossier compilé (dist) depuis l'étape build
COPY --from=builder /app/dist ./dist

# Exposer le port du serveur
EXPOSE 3000

# Commande de lancement
CMD ["node", "dist/index.js"]
