
# AZD templates reference

Templates from the [Azure Developer CLI templates overview](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/azd-templates). Match the feature's primary use case and language to a template.

| Use case | Languages | App host | Data | IaC | Template |
| --- | --- | --- | --- | --- | --- |
| Microsoft Foundry (hosted agents, models) | C#, Python | — | — | Bicep | [azd-ai-starter-basic](https://github.com/Azure-Samples/azd-ai-starter-basic) |
| Web app + REST API + NoSQL | C# | App Service | Cosmos DB for NoSQL | Bicep | [todo-csharp-cosmos-sql](https://github.com/Azure-Samples/todo-csharp-cosmos-sql) |
| Web app + REST API + relational | C# | App Service | Azure SQL | Bicep | [todo-csharp-sql](https://github.com/azure-samples/todo-csharp-sql) |
| Static web app + Functions API + relational | C# | SWA + Functions | Azure SQL | Bicep | [todo-csharp-sql-swa-func](https://github.com/Azure-Samples/todo-csharp-sql-swa-func) |
| Web app + REST API + document DB | Java | App Service | Cosmos DB (Mongo) | Bicep | [todo-java-mongo](https://github.com/Azure-Samples/todo-java-mongo) |
| Containerized web app + API + document DB | Java | Container Apps | Cosmos DB (Mongo) | Bicep | [todo-java-mongo-aca](https://github.com/Azure-Samples/todo-java-mongo-aca) |
| Web app + REST API + document DB | Node.js | App Service | Cosmos DB (Mongo) | Bicep | [todo-nodejs-mongo](https://github.com/azure-samples/todo-nodejs-mongo) |
| Web app + REST API + document DB | Node.js | App Service | Cosmos DB (Mongo) | Terraform | [todo-nodejs-mongo-terraform](https://github.com/azure-samples/todo-nodejs-mongo-terraform) |
| Containerized web app + API + document DB | Node.js | Container Apps | Cosmos DB (Mongo) | Bicep | [todo-nodejs-mongo-aca](https://github.com/azure-samples/todo-nodejs-mongo-aca) |
| Static web app + Functions API + document DB | Node.js | SWA + Functions | Cosmos DB (Mongo) | Bicep | [todo-nodejs-mongo-swa-func](https://github.com/azure-samples/todo-nodejs-mongo-swa-func) |
| Kubernetes web app + API + document DB | Node.js | AKS | Cosmos DB (Mongo) | Bicep | [todo-nodejs-mongo-aks](https://github.com/Azure-Samples/todo-nodejs-mongo-aks) |
| Web app + REST API + document DB | Python | App Service | Cosmos DB (Mongo) | Bicep | [todo-python-mongo](https://github.com/azure-samples/todo-python-mongo) |
| Web app + REST API + document DB | Python | App Service | Cosmos DB (Mongo) | Terraform | [todo-python-mongo-terraform](https://github.com/Azure-Samples/todo-python-mongo-terraform) |
| Containerized web app + API + document DB | Python | Container Apps | Cosmos DB (Mongo) | Bicep | [todo-python-mongo-aca](https://github.com/azure-samples/todo-python-mongo-aca) |
| Static web app + Functions API + document DB | Python | SWA + Functions | Cosmos DB (Mongo) | Bicep | [todo-python-mongo-swa-func](https://github.com/azure-samples/todo-python-mongo-swa-func) |
| Greenfield IaC only | Any | — | — | Bicep | [azd-starter-bicep](https://github.com/Azure-Samples/azd-starter-bicep) |
| Greenfield IaC only | Any | — | — | Terraform | [azd-starter-terraform](https://github.com/Azure-Samples/azd-starter-terraform) |
