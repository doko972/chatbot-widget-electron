# 🚀 Guide d'installation rapide

## Étapes pour démarrer

### 1. Préparer le projet Electron

```bash
# Naviguer vers le dossier
cd chatbot-widget-electron

# Installer les dépendances
npm install
```

### 2. Créer une icône (optionnel mais recommandé)

Placez un fichier PNG (256x256px) dans `assets/icon.png`

Vous pouvez utiliser un générateur d'icônes en ligne comme :
- https://www.icoconverter.com/
- https://favicon.io/

### 3. Configurer Laravel pour accepter les requêtes API

**A. Installer Laravel Sanctum (si pas déjà fait)**

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

**B. Ajouter dans `app/Http/Kernel.php`**

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

**C. Créer le middleware pour les tokens personnalisés**

Fichier : `app/Http/Middleware/ChatbotTokenAuth.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ChatbotToken;
use Illuminate\Http\Request;

class ChatbotTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        $chatbotToken = ChatbotToken::where('token', $token)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$chatbotToken) {
            return response()->json(['error' => 'Token invalide'], 401);
        }

        // Optionnel : Attacher l'utilisateur
        if ($chatbotToken->user_id) {
            auth()->loginUsingId($chatbotToken->user_id);
        }

        return $next($request);
    }
}
```

**D. Enregistrer le middleware dans `app/Http/Kernel.php`**

```php
protected $middlewareAliases = [
    // ... autres middlewares
    'chatbot.token' => \App\Http\Middleware\ChatbotTokenAuth::class,
];
```

### 4. Créer la migration pour les tokens

```bash
php artisan make:migration create_chatbot_tokens_table
```

Fichier de migration :

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('chatbot_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('token', 64)->unique();
            $table->string('name')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chatbot_tokens');
    }
};
```

Puis :

```bash
php artisan migrate
```

### 5. Créer le modèle ChatbotToken

Fichier : `app/Models/ChatbotToken.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'name',
        'expires_at',
        'last_used_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### 6. Ajouter une route pour générer des tokens

Dans votre `DashboardController.php` ou créez un nouveau contrôleur :

```php
use App\Models\ChatbotToken;
use Illuminate\Support\Str;

public function generateApiToken(Request $request)
{
    $token = ChatbotToken::create([
        'user_id' => auth()->id(),
        'token' => Str::random(64),
        'name' => $request->name ?? 'Widget Desktop',
        'expires_at' => now()->addYear()
    ]);

    return response()->json([
        'success' => true,
        'token' => $token->token,
        'expires_at' => $token->expires_at
    ]);
}
```

Route dans `routes/web.php` :

```php
Route::middleware(['auth'])->group(function () {
    Route::post('/dashboard/generate-token', [DashboardController::class, 'generateApiToken'])
        ->name('dashboard.generate-token');
});
```

### 7. Ajouter un bouton dans le dashboard

Dans `resources/views/dashboard.blade.php` :

```html
<div class="card">
    <div class="card-header">
        <h3>Token API pour Widget Desktop</h3>
    </div>
    <div class="card-body">
        <button id="generateTokenBtn" class="btn btn-primary">
            Générer un nouveau token
        </button>
        <div id="tokenDisplay" class="mt-3" style="display: none;">
            <strong>Votre token :</strong>
            <code id="tokenValue" style="display: block; padding: 10px; background: #f5f5f5; margin-top: 10px;"></code>
            <small class="text-muted">Copiez ce token et collez-le dans le widget desktop</small>
        </div>
    </div>
</div>

<script>
document.getElementById('generateTokenBtn').addEventListener('click', async function() {
    try {
        const response = await fetch('/dashboard/generate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('tokenValue').textContent = data.token;
            document.getElementById('tokenDisplay').style.display = 'block';
        }
    } catch (error) {
        alert('Erreur lors de la génération du token');
    }
});
</script>
```

### 8. Lancer le widget

```bash
# Assurez-vous que Laravel tourne
cd /chemin/vers/votre/projet-laravel
php artisan serve

# Dans un autre terminal, lancez le widget
cd chatbot-widget-electron
npm start
```

### 9. Configurer le widget

1. Cliquez sur ⚙️ dans le widget
2. Entrez l'URL : `http://localhost:8000`
3. Collez le token généré depuis le dashboard
4. Cliquez sur "Tester la connexion"
5. Enregistrez

## ✅ C'est prêt !

Vous pouvez maintenant discuter avec votre chatbot directement depuis Windows !

## 🎁 Build de production

Pour créer l'installateur Windows :

```bash
npm run build-win
```

L'installateur sera dans le dossier `dist/`

---

**Astuce** : Pour que le widget démarre automatiquement avec Windows, créez un raccourci dans :
`C:\Users\VotreNom\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
