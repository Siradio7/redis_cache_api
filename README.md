# Redis Cache API

API REST développée avec Node.js permettant de gérer des produits avec MySQL et Redis.

Le projet met en œuvre une architecture en couches ainsi qu'un système de cache Redis basé sur le pattern **Cache-Aside**, avec TTL, invalidation du cache et protection contre le **cache stampede**.

## Fonctionnalités

- Création de produits
- Récupération d'un produit par son ID
- Modification d'un produit
- Suppression d'un produit
- Cache Redis
- TTL configurable
- Activation/désactivation du cache
- Invalidation du cache après modification ou suppression
- Statistiques HIT / MISS
- Protection contre le cache stampede avec un lock Redis
- Benchmark des performances
- Exécution avec Docker Compose

## Technologies

- Node.js
- Express
- MySQL
- Redis
- Docker
- Docker Compose

## Architecture

```text
src/
├── benchmark/
│   └── cache.js
├── cache/
│   ├── redis.js
│   └── lock.js
├── controllers/
│   ├── product.js
│   └── cache.js
├── repositories/
│   ├── mysql.js
│   └── product.js
├── routes/
│   ├── product.js
│   └── cache.js
├── services/
│   ├── product.js
│   └── cache.js
└── index.js
```

### Flux de traitement

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├──────────────► Redis
  │
  ▼
Repositories
  │
  ▼
MySQL
```

### Responsabilités

**Routes**
- Définissent les endpoints HTTP.
- Délèguent les requêtes aux controllers.

**Controllers**
- Gèrent les paramètres HTTP.
- Appellent les services.
- Construisent les réponses HTTP.

**Services**
- Contiennent la logique métier.
- Gèrent le cache et son invalidation.
- Coordonnent Redis et les repositories.

**Repositories**
- Gèrent l'accès à MySQL.

**Cache**
- Centralise la connexion Redis.
- Gère les locks Redis.

## Cache Redis

Le projet utilise le pattern **Cache-Aside**.

Lors d'une requête `GET /products/:id` :

```text
              GET /products/:id
                      │
                      ▼
                  Redis GET
                      │
                ┌─────┴─────┐
                │           │
               HIT         MISS
                │           │
                ▼           ▼
             Retour      Lock Redis
                            │
                            ▼
                          MySQL
                            │
                            ▼
                       Redis SET
                            │
                            ▼
                          Retour
```

### Cache HIT

Lorsque le produit existe dans Redis, il est retourné directement sans interroger MySQL.

### Cache MISS

Lorsque le produit n'existe pas dans Redis :

1. Un lock Redis est tenté.
2. La requête qui obtient le lock interroge MySQL.
3. Le résultat est placé dans Redis avec un TTL.
4. Le lock est libéré.
5. Les autres requêtes récupèrent le produit depuis Redis.

## Protection contre le cache stampede

Sans protection, l'expiration d'une entrée peut provoquer plusieurs requêtes simultanées vers MySQL :

```text
100 requêtes
    │
    ├──► MySQL
    ├──► MySQL
    ├──► MySQL
    ├──► MySQL
    └──► ...
```

Le projet utilise un lock Redis avec :

```text
SET key value NX EX
```

- `NX` : le lock est créé uniquement s'il n'existe pas.
- `EX` : le lock possède une durée d'expiration.
- Une valeur unique est associée au lock.

Les autres requêtes attendent ensuite que le produit soit disponible dans Redis.

## Invalidation du cache

Lorsqu'un produit est modifié :

```text
UPDATE MySQL
     │
     ▼
DEL product:id
```

Lorsqu'un produit est supprimé :

```text
DELETE MySQL
     │
     ▼
DEL product:id
```

Cela évite de conserver une ancienne version du produit dans Redis.

## Statistiques

Endpoint :

```http
GET /cache/stats
```

Exemple :

```json
{
  "hits": 41,
  "misses": 1,
  "total": 42,
  "hitRate": 97.61904761904762
}
```

Les statistiques permettent de mesurer l'efficacité du cache.

## API

### Créer un produit

```http
POST /products
Content-Type: application/json
```

```json
{
  "name": "MacBook Pro",
  "description": "Ordinateur portable Apple",
  "price": 1999.99
}
```

### Récupérer un produit

```http
GET /products/:id
```

Exemple :

```http
GET /products/1
```

### Modifier un produit

```http
PUT /products/:id
Content-Type: application/json
```

```json
{
  "name": "MacBook Pro M5",
  "description": "Nouveau modèle",
  "price": 2199.99
}
```

### Supprimer un produit

```http
DELETE /products/:id
```

### Statistiques du cache

```http
GET /cache/stats
```

## Configuration

Créer un fichier `.env` :

```env
PORT=3000

MYSQL_HOST=mysql
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=products

REDIS_HOST=redis
REDIS_PORT=6379

CACHE_ENABLED=true
CACHE_TTL=60
```

### CACHE_ENABLED

Active ou désactive le cache Redis.

```env
CACHE_ENABLED=true
```

Pour désactiver le cache :

```env
CACHE_ENABLED=false
```

### CACHE_TTL

Durée de vie d'une entrée Redis en secondes.

```env
CACHE_TTL=60
```

## Docker

Démarrer les services :

```bash
docker compose up -d
```

Reconstruire les images :

```bash
docker compose up -d --build
```

Voir les services :

```bash
docker compose ps
```

Voir les logs de l'API :

```bash
docker logs rc_api
```

## Redis CLI

Accéder au CLI Redis :

```bash
docker compose exec redis redis-cli
```

Vider la base Redis :

```bash
docker compose exec redis redis-cli FLUSHDB
```

Afficher les clés :

```bash
docker compose exec redis redis-cli KEYS "*"
```

## Benchmark

Le projet contient un benchmark pour mesurer les performances du cache :

```bash
node src/benchmark/cache.js
```

Exemple :

```text
Cache benchmark

First request: 60.44 ms
Concurrent requests: 100
Average: 36.50 ms
Min: 32.45 ms
Max: 42.66 ms
P50: 36.40 ms
P95: 42.02 ms
P99: 42.38 ms
```

Le benchmark permet notamment de comparer les performances avec Redis activé et désactivé.

La protection contre le cache stampede peut également être vérifiée avec les logs MySQL. Après un cache miss suivi de nombreuses requêtes concurrentes, une seule requête doit normalement effectuer la lecture initiale depuis MySQL.

## Base de données

Exemple de table `products` :

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

## Objectifs du projet

Ce projet permet de mettre en pratique :

- Architecture en couches
- Pattern Repository
- Pattern Service
- Pattern Controller
- Cache-Aside Pattern
- Redis
- TTL
- Invalidation de cache
- Distributed Lock
- Prévention du cache stampede
- Docker et Docker Compose
- Benchmark et analyse des performances

## Évolutions possibles

- Tests unitaires
- Tests d'intégration
- Middleware global de gestion des erreurs
- Validation avancée des données
- Rate limiting
- Monitoring avec Prometheus
- Visualisation avec Grafana
- Tests de charge
- Documentation OpenAPI / Swagger
- CI/CD
