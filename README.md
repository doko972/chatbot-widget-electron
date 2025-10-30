# Chatbot Widget Windows 11

Widget de bureau Windows pour votre chatbot Laravel utilisant Electron.

## 📋 Prérequis

- Node.js 18+ installé
- Votre application Laravel fonctionnelle
- Token API généré depuis votre dashboard Laravel

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd chatbot-widget-electron
npm install
```

### 2. Créer les icônes (optionnel)

Placez une icône au format PNG/ICO dans le dossier `assets/`:
- `assets/icon.png` (pour Linux/Mac)
- `assets/icon.ico` (pour Windows)

Si vous n'avez pas d'icône, créez le dossier et une icône par défaut :

```bash
mkdir assets
# Ajoutez votre icône ici
```

### 3. Configuration Laravel (Backend)

Assurez-vous que votre API Laravel est configurée pour accepter les requêtes du widget :

**Dans `config/cors.php`** :

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'], // En production, spécifiez les origines
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

**Routes API nécessaires dans `routes/api.php`** :

```php
Route::middleware('chatbot.token')->group(function () {
    // Test de connexion
    Route::get('/chatbot/test', [ApiChatbotController::class, 'test']);
    
    // Envoi de message
    Route::post('/chatbot/message', [ApiChatbotController::class, 'sendMessage']);
    
    // Historique (optionnel)
    Route::get('/chatbot/conversations', [ApiChatbotController::class, 'getConversations']);
});
```

**Exemple de contrôleur `ApiChatbotController.php`** :

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use Illuminate\Support\Facades\Http;

class ApiChatbotController extends Controller
{
    public function test()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie'
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|exists:conversations,id'
        ]);

        // Créer ou récupérer la conversation
        $conversation = $request->conversation_id 
            ? Conversation::find($request->conversation_id)
            : Conversation::create([
                'user_id' => auth()->id() ?? null,
                'title' => 'Widget - ' . now()->format('Y-m-d H:i')
            ]);

        // Sauvegarder le message utilisateur
        $conversation->messages()->create([
            'role' => 'user',
            'content' => $request->message
        ]);

        // Appeler l'API ChatGPT
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Tu es un assistant IA utile et sympathique.'
                ],
                [
                    'role' => 'user',
                    'content' => $request->message
                ]
            ],
            'temperature' => 0.7,
        ]);

        $aiResponse = $response->json()['choices'][0]['message']['content'] ?? 'Erreur lors de la génération de la réponse.';

        // Sauvegarder la réponse
        $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $aiResponse
        ]);

        return response()->json([
            'conversation_id' => $conversation->id,
            'response' => $aiResponse
        ]);
    }

    public function getConversations(Request $request)
    {
        $conversations = Conversation::with('messages')
            ->where('user_id', auth()->id())
            ->latest()
            ->take(10)
            ->get();

        return response()->json($conversations);
    }
}
```

## 🎯 Utilisation

### Mode développement

```bash
npm start
```

### Construire l'application pour Windows

```bash
npm run build-win
```

L'installateur sera créé dans le dossier `dist/`.

## ⚙️ Configuration du widget

1. **Lancer le widget** : Double-cliquez sur l'application
2. **Cliquer sur l'icône ⚙️** dans la barre de titre
3. **Renseigner** :
   - URL de l'API Laravel : `http://localhost:8000` (ou votre domaine en production)
   - Token API : récupérez-le depuis votre dashboard Laravel
4. **Tester la connexion** avec le bouton prévu
5. **Enregistrer** les paramètres

## 🔑 Génération du Token API

Dans votre application Laravel, créez une route pour générer des tokens :

```php
// Dans votre DashboardController ou un contrôleur dédié
public function generateToken()
{
    $token = ChatbotToken::create([
        'user_id' => auth()->id(),
        'token' => Str::random(64),
        'name' => 'Widget Desktop',
        'expires_at' => now()->addYear()
    ]);

    return response()->json([
        'token' => $token->token
    ]);
}
```

## 🎨 Fonctionnalités

- ✅ Interface moderne et épurée
- ✅ Fenêtre flottante toujours visible (option épinglage)
- ✅ Minimisation dans la barre des tâches
- ✅ Icône dans le system tray
- ✅ Sauvegarde automatique de la position
- ✅ Historique de conversation
- ✅ Indicateur de frappe
- ✅ Auto-resize du champ de saisie
- ✅ Scroll automatique
- ✅ Gestion des erreurs

## 📱 Raccourcis

- **Entrée** : Envoyer le message
- **Shift + Entrée** : Nouvelle ligne

## 🔧 Personnalisation

### Modifier les couleurs

Dans `styles.css`, modifiez les gradients :

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifier la taille de la fenêtre

Dans `main.js` :

```javascript
const WINDOW_WIDTH = 380;  // Largeur
const WINDOW_HEIGHT = 600; // Hauteur
```

## 🐛 Dépannage

### Le widget ne se connecte pas

1. Vérifiez que Laravel tourne : `php artisan serve`
2. Testez l'API avec Postman/Insomnia
3. Vérifiez les CORS dans Laravel
4. Consultez la console Electron (décommentez `openDevTools()` dans `main.js`)

### Erreur de token

1. Vérifiez que le middleware `chatbot.token` est bien configuré
2. Générez un nouveau token
3. Vérifiez la date d'expiration du token

### L'icône ne s'affiche pas

Créez le dossier `assets/` et ajoutez vos icônes :
- Format : PNG (256x256) ou ICO
- Nom : `icon.png` ou `icon.ico`

## 📦 Structure du projet

```
chatbot-widget-electron/
├── main.js              # Point d'entrée Electron
├── preload.js           # Bridge sécurisé
├── index.html           # Interface
├── styles.css           # Styles
├── renderer.js          # Logique frontend
├── package.json         # Configuration npm
└── assets/              # Ressources (icônes)
    ├── icon.png
    └── icon.ico
```

## 🚢 Déploiement

### Distribuer l'application

Après `npm run build-win`, partagez :
- Le fichier `.exe` dans `dist/`
- Ou l'installateur NSIS généré

### En production

1. Changez l'URL de l'API vers votre domaine de production
2. Utilisez HTTPS
3. Implémentez le refresh automatique du token
4. Ajoutez un système de mise à jour automatique (electron-updater)

## 📄 Licence

MIT

## 👨‍💻 Auteur

Atelier Normand Du Web

---

**Besoin d'aide ?** Consultez la documentation Laravel et Electron.
