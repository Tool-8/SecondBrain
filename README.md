# SecondBrain

[![Tests & Coverage](https://github.com/Tool-8/SecondBrain/actions/workflows/tests.yml/badge.svg)](https://github.com/Tool-8/SecondBrain/actions/workflows/tests.yml)
[![Coverage](https://codecov.io/gh/Tool-8/SecondBrain/branch/main/graph/badge.svg)](https://codecov.io/gh/Tool-8/SecondBrain)

## Setup

### 1. Clona la repository
**Con Git:**
```bash
git clone https://github.com/Tool-8/SecondBrain.git
```

**In alternativa**, scarica lo ZIP dalla [pagina del progetto](https://github.com/Tool-8/SecondBrain) e decomprimilo.

---

### 2. Configurazione ambiente
Nella root del progetto, crea un file .env con il seguente contenuto:
```env
APP_URL = http://localhost:8080
APP_KEY =
SESSION_DRIVER = database
CACHE_STORE = database
QUEUE_CONNECTION = database
LOG_CHANNEL = stack
LOG_STACK = single
LOG_LEVEL = info
MAIL_MAILER = log
MAIL_HOST =127.0.0.1
MAIL_PORT =2525
MAIL_USERNAME = null
MAIL_PASSWORD = null
MAIL_ENCRYPTION = null
MAIL_FROM_ADDRESS = hello@example.com
MAIL_FROM_NAME = SecondBrain
LLM_BASE_URL = <URL_BASE_LLM>
LLM_API_KEY = <TUA_CHIAVE_API_KEY>
LLM_MODEL = <MODELLO_LLM>
```

Sostituire i valori di <URL_BASE_LLM>, <TUA_CHIAVE_API_KEY> e <MODELLO_LLM> con quelli forniti dall'azienda Zucchetti.

### 3. Avvio applicazione
Assicurati di avere Docker installato, esegui:
```bash
make deploy
```

Nel caso in cui make non sia disponibile:
```bash
DOCKER_UID=$(id -u) DOCKER_GID=$(id -g) docker compose -f docker-compose.deploy.yml up -d --build
```

### 4. Accedi al sistema 
Dopo l'avvio, l'applicazione è accessibile aprendo il proprio browser all'indirizzo:
http://localhost:8080 

App disponibile su:
http://localhost:8080

### 5. Arresto applicazione 
Per arrestare l'applicazione è sufficiente eseguire:
```bash
make deploy-down
```

Nel caso in cui make non sia disponibile:
```bash
DOCKER_UID=$(id -u) DOCKER_GID=$(id -g) docker compose -f docker-compose.deploy.yml down
```
