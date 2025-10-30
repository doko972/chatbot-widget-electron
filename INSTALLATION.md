# 🚀 Guide d'installation rapide

## Étapes pour démarrer

### 1. Préparer le projet Electron

```bash
# Naviguer vers le dossier
cd chatbot-widget-electron

# Installer les dépendances
npm install
```
### 2. Supprimer l'ancien projet
```bash
Remove-Item -Path "dist" -Recurse -Force
```
### 3. Compiler
```bash
npm run build-portable
```