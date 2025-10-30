# 🚀 Améliorations Futures

Ce document liste les améliorations possibles pour le widget chatbot.

## ✨ Fonctionnalités à ajouter

### 1. Historique des conversations
- [ ] Afficher la liste des conversations précédentes
- [ ] Permettre de reprendre une conversation
- [ ] Recherche dans l'historique
- [ ] Export des conversations en PDF/TXT

### 2. Personnalisation
- [ ] Thèmes clairs/sombres
- [ ] Choix de la couleur principale
- [ ] Personnalisation de la taille de police
- [ ] Positionnement sauvegardé automatiquement

### 3. Raccourcis clavier
- [ ] `Ctrl + N` : Nouvelle conversation
- [ ] `Ctrl + H` : Afficher l'historique
- [ ] `Ctrl + ,` : Paramètres
- [ ] `Ctrl + Q` : Quitter
- [ ] `Ctrl + K` : Effacer la conversation

### 4. Notifications
- [ ] Notifications Windows quand le bot répond
- [ ] Son personnalisable
- [ ] Badge de compteur de nouveaux messages

### 5. Fonctionnalités avancées
- [ ] Support du Markdown dans les réponses
- [ ] Code syntax highlighting
- [ ] Upload de fichiers/images
- [ ] Reconnaissance vocale (speech-to-text)
- [ ] Text-to-speech pour les réponses
- [ ] Mode dictée

### 6. Sécurité
- [ ] Chiffrement du token dans le localStorage
- [ ] Refresh automatique du token
- [ ] Déconnexion automatique après inactivité
- [ ] Authentification biométrique (Windows Hello)

### 7. Performance
- [ ] Cache des réponses fréquentes
- [ ] Chargement progressif de l'historique
- [ ] Optimisation mémoire
- [ ] Mode hors ligne avec réponses en attente

### 8. Intégration système
- [ ] Démarrage automatique avec Windows
- [ ] Raccourci global (ex: `Ctrl + Shift + A`)
- [ ] Jump List Windows
- [ ] Intégration dans le menu contextuel Windows

### 9. Multi-langue
- [ ] Interface en français/anglais
- [ ] Détection automatique de la langue
- [ ] Traduction des réponses

### 10. Analytics
- [ ] Statistiques d'utilisation
- [ ] Temps de réponse moyen
- [ ] Messages les plus fréquents
- [ ] Export des statistiques

## 🔧 Améliorations techniques

### Code
```javascript
// Exemple : Implémentation du cache
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
    
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key, maxAge = 3600000) { // 1 heure par défaut
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > maxAge) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
}
```

### Auto-update
```javascript
// Exemple avec electron-updater
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
    // Notifier l'utilisateur
});

autoUpdater.on('update-downloaded', () => {
    // Proposer de redémarrer
});
```

### Raccourcis globaux
```javascript
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
    // Enregistrer un raccourci global
    globalShortcut.register('CommandOrControl+Shift+C', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });
});
```

## 📦 Packages utiles

- `electron-store` : Persistance des données
- `electron-updater` : Mises à jour automatiques
- `electron-log` : Système de logging
- `marked` : Rendu Markdown
- `highlight.js` : Coloration syntaxique du code
- `electron-context-menu` : Menu contextuel
- `speech-recognition` : Reconnaissance vocale
- `node-notifier` : Notifications natives

## 🎨 Améliorations UI/UX

### Animations
```css
/* Exemple : Animation d'apparition des messages */
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.message {
    animation: slideInRight 0.3s ease-out;
}
```

### Skeleton loading
```html
<!-- Pendant le chargement -->
<div class="skeleton-message">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
</div>
```

## 🔐 Sécurité renforcée

### Chiffrement du token
```javascript
const crypto = require('crypto');

class SecureStorage {
    constructor(key) {
        this.algorithm = 'aes-256-gcm';
        this.key = crypto.scryptSync(key, 'salt', 32);
    }
    
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            iv: iv.toString('hex'),
            encrypted,
            authTag: authTag.toString('hex')
        };
    }
    
    decrypt(data) {
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(data.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
        
        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

## 📱 Version mobile/tablette

Considérer de créer une version PWA pour :
- iOS
- Android
- Tablettes

## 🌐 Sync multi-appareils

- Synchronisation via Firebase ou Supabase
- Conversations accessibles sur tous les appareils
- Notifications push

---

**Priorités suggérées :**
1. Thème sombre
2. Historique des conversations
3. Raccourcis clavier
4. Auto-update
5. Support Markdown
