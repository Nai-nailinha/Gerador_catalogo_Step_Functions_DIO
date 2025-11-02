
# ☁️ Netflix Catalog Functions — Azure Functions + Cosmos DB + Storage

Projeto mínimo para o desafio **“Criando um Gerenciador de Catálogos da Netflix com Azure Functions e Banco de Dados”** (DIO).

## 🚀 Stack
- **Azure Functions (Node 20)** — HTTP triggers
- **Azure Cosmos DB (SQL API)** — container `catalogs` particionado por `/genre`
- **Azure Storage (Blob)** — container `uploads` para arquivos (ex.: capas)

## ✅ Pré-requisitos
- Node 20+
- Azure CLI (`az`)
- Azure Functions Core Tools v4 (`func`)
- Conta no Azure

## 1) Recursos na Azure
```bash
az login
az group create -n rg-netflix -l brazilsouth

# Storage
az storage account create -n stnetflix$RANDOM -g rg-netflix -l brazilsouth --sku Standard_LRS

# Cosmos DB
az cosmosdb create -n cosmos-netflix -g rg-netflix --kind GlobalDocumentDB
az cosmosdb sql database create -a cosmos-netflix -g rg-netflix -n netflixdb
az cosmosdb sql container create -a cosmos-netflix -g rg-netflix -d netflixdb -n catalogs --partition-key-path "/genre"

# Function App
az functionapp create -g rg-netflix -n fa-netflix-$RANDOM   --runtime node --runtime-version 20   --consumption-plan-location brazilsouth   --storage-account stnetflixXXXX   # troque pelo storage criado
```

Guarde as strings:
```bash
COSMOS_CONN=$(az cosmosdb keys list -n cosmos-netflix -g rg-netflix --type connection-strings --query "connectionStrings[0].connectionString" -o tsv)
ST_CONN=$(az storage account show-connection-string -g rg-netflix -n stnetflixXXXX -o tsv --query connectionString)
az storage container create --name uploads --account-name stnetflixXXXX --auth-mode key
```

## 2) Rodar local
Crie/edite `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONN_STRING": "<COSMOS_CONN>",
    "COSMOS_DB": "netflixdb",
    "COSMOS_CONTAINER": "catalogs",
    "STORAGE_CONN_STRING": "<ST_CONN>",
    "STORAGE_CONTAINER": "uploads"
  }
}
```
Depois:
```bash
npm i
func start
```

## 3) Endpoints
```
POST /api/createCatalog        # body: { id, title, genre, year?, rating?, coverUrl? }
GET  /api/listCatalogs
GET  /api/filterCatalogs?genre=...&title=...
POST /api/uploadFile           # body: { filename, fileBase64 }
```

## 4) Deploy
```bash
# App settings
az functionapp config appsettings set -g rg-netflix -n fa-netflix-XXXXX   --settings COSMOS_CONN_STRING="$COSMOS_CONN" COSMOS_DB=netflixdb COSMOS_CONTAINER=catalogs              STORAGE_CONN_STRING="$ST_CONN" STORAGE_CONTAINER=uploads

# Publicar
func azure functionapp publish fa-netflix-XXXXX
```

## 5) Testes rápidos
```bash
curl -X POST https://<app>.azurewebsites.net/api/createCatalog   -H "Content-Type: application/json"   -d '{"id":"tt0133093","title":"The Matrix","genre":"sci-fi","year":1999,"rating":8.7}'

curl https://<app>.azurewebsites.net/api/listCatalogs
curl "https://<app>.azurewebsites.net/api/filterCatalogs?genre=sci-fi"

# Upload (enviar base64)
curl -X POST https://<app>.azurewebsites.net/api/uploadFile   -H "Content-Type: application/json"   -d '{"filename":"poster.png","fileBase64":"<BASE64_AQUI>"}'
```

---

### Assinatura
Feito com café, código e neurônios por **Enaile Lopes**  
LinkedIn: https://www.linkedin.com/in/enailelopes/  
🌐 ticomcafeeneuronios.com.br ☕💜
