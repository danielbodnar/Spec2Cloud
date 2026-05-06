---
name: models-selector
description: Select Microsoft Foundry models and regions, then configure azd environment variables (AZURE_LOCATION and AI_PROJECT_DEPLOYMENTS). Use when the user wants to choose, compare, or deploy AI models in Azure, set model deployments for azd provisioning, pick a region for AI workloads, or configure which models to deploy in their Azure AI Foundry project. Also use when user mentions model selection, model availability, region selection for AI, or azd env set for models.
---

# Foundry Models Selector

Configure `AZURE_LOCATION` and `AI_PROJECT_DEPLOYMENTS` azd environment variables by selecting the right models and regions for the user's needs.

## Preferred Models by Task & Modality

Use this section to recommend models based on what the user needs. Always suggest the best-fit model first, then offer alternatives.

### Chat & General Purpose (Text In / Text Out)

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `gpt-5-mini` | OpenAI | `2025-08-07` | Best balance of capability, speed, and cost. No registration required. |
| Strong | `gpt-4.1-mini` | OpenAI | `2025-04-14` | Fast, cheap, 1M token context, great for most tasks. |
| Strong | `gpt-5-nano` | OpenAI | `2025-08-07` | Cheapest GPT-5 series. No registration required. |
| Premium | `gpt-5` | OpenAI | `2025-08-07` | Top-tier reasoning. Registration required. |
| Premium | `gpt-5.1` | OpenAI | `2025-11-13` | Latest reasoning model. Registration required. |
| Alt | `DeepSeek-V3.2` | DeepSeek | `1` | Strong open-weight alternative. All regions. |
| Alt | `Llama-4-Maverick-17B-128E-Instruct-FP8` | Meta | `1` | Open-weight, 1M context, multimodal. All regions. |

### Advanced Reasoning & Complex Problem Solving

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `o4-mini` | OpenAI | `2025-04-16` | Best reasoning-to-cost ratio. |
| Strong | `o3` | OpenAI | `2025-04-16` | Stronger reasoning, higher cost. |
| Strong | `DeepSeek-R1-0528` | DeepSeek | `1` | Open-weight reasoning model. All regions. |
| Premium | `gpt-5` | OpenAI | `2025-08-07` | Full GPT-5 reasoning. Registration required. |
| Premium | `gpt-5.1` | OpenAI | `2025-11-13` | Latest reasoning. Registration required. |
| Alt | `grok-4-fast-reasoning` | xAI | `1` | External reasoning alternative. All regions. |
| Alt | `Kimi-K2-Thinking` | Moonshot | `1` | Open-weight, 262K context, tool calling. All regions. |

### Coding & Development

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `gpt-4.1` | OpenAI | `2025-04-14` | 1M token context, great for large codebases. |
| Strong | `gpt-4.1-mini` | OpenAI | `2025-04-14` | Cost-efficient coding with large context. |
| Strong | `codex-mini` | OpenAI | `2025-05-16` | Fine-tuned o4-mini for code. East US 2 & Sweden Central only. |
| Alt | `grok-code-fast-1` | xAI | `1` | External coding specialist. Registration required. |
| Alt | `DeepSeek-V3.2` | DeepSeek | `1` | Strong coding performance, all regions. |

### Multimodal (Text + Image Input)

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `gpt-5-mini` | OpenAI | `2025-08-07` | Vision + text, cost-efficient. |
| Strong | `gpt-4.1` | OpenAI | `2025-04-14` | 1M context with vision. |
| Strong | `o4-mini` | OpenAI | `2025-04-16` | Vision + reasoning. |
| Alt | `Llama-4-Maverick-17B-128E-Instruct-FP8` | Meta | `1` | Open-weight multimodal, 1M context. |
| Alt | `Kimi-K2.5` | Moonshot | `1` | Multimodal reasoning. All regions. |

### Embeddings

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `text-embedding-3-large` | OpenAI | `1` | Best quality embeddings, 3072 dimensions. |
| Smaller | `text-embedding-3-small` | OpenAI | `1` | Cheaper, 1536 dimensions. |
| Legacy | `text-embedding-ada-002` | OpenAI | `2` | Older model, still widely used. |

### Image Generation

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `gpt-image-1` | OpenAI | `1` | Best quality. Registration required. Limited regions. |
| Alt | `dall-e-3` | OpenAI | `3.0` | Generally available. East US, Australia East, Sweden Central. |
| Alt | `FLUX.2-pro` | BlackForestLabs | `1` | Multi-reference support. All regions. |

### Document Processing

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `mistral-document-ai-2505` | MistralAI | `1` | PDF/image to text specialist. All regions. |

### Cost-Optimized Routing

| Priority | Model | Format | Version | Why |
|----------|-------|--------|---------|-----|
| **Best** | `model-router` | Microsoft | `2025-11-18` | Automatically routes to optimal model. Up to 60% savings. East US 2 & Sweden Central only. |

## How to Set Environment Variables

### Set Azure Location

```bash
azd env set AZURE_LOCATION "<region>"
```

Example:
```bash
azd env set AZURE_LOCATION "eastus2"
```

### Set Model Deployments

```bash
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'<deployment-name>', 'model': {'name': '<model-name>','format': '<format>', 'version':'<version>'},'sku': {'name': '<sku-name>','capacity':<capacity>}}]"
```

Single model example:
```bash
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-5-mini', 'model': {'name': 'gpt-5-mini','format': 'OpenAI', 'version':'2025-08-07'},'sku': {'name': 'GlobalStandard','capacity':100}}]"
```

Multiple models example:
```bash
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-4.1-mini', 'model': {'name': 'gpt-4.1-mini','format': 'OpenAI', 'version':'2025-04-14'},'sku': {'name': 'GlobalStandard','capacity':100}}, {'name':'DeepSeek-V3.2', 'model': {'name': 'DeepSeek-V3.2','format': 'DeepSeek', 'version':'1'},'sku': {'name': 'GlobalStandard','capacity':100}}]"
```

## Deployment Entry Format

Each deployment entry in the JSON array:

```
{
  'name': '<deployment-name>',        # Deployment name (typically same as model name)
  'model': {
    'name': '<model-name>',           # Exact model name from tables below
    'format': '<format>',             # Provider format (see Model Catalog)
    'version': '<version>'            # Model version string
  },
  'sku': {
    'name': '<sku-name>',             # Usually 'GlobalStandard'
    'capacity': <number>              # TPM in thousands (e.g., 100 = 100K TPM)
  }
}
```

## Model Catalog

### Azure OpenAI Models (format: `OpenAI`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `gpt-5.2-codex` | `2026-01-14` | Text+Image→Text (Reasoning, Codex) | 400K | GlobalStandard |
| `gpt-5.2` | `2025-12-11` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-5.2-chat` | `2025-12-11` | Text→Text (Preview) | 128K | GlobalStandard |
| `gpt-5.1` | `2025-11-13` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-5.1-chat` | `2025-11-13` | Text→Text (Preview, Reasoning) | 128K | GlobalStandard |
| `gpt-5.1-codex` | `2025-11-13` | Text+Image→Text (Codex) | 400K | GlobalStandard |
| `gpt-5.1-codex-mini` | `2025-11-13` | Text+Image→Text (Codex) | 400K | GlobalStandard |
| `gpt-5.1-codex-max` | `2025-12-04` | Text+Image→Text (Codex) | 400K | GlobalStandard |
| `gpt-5` | `2025-08-07` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-5-mini` | `2025-08-07` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-5-nano` | `2025-08-07` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-5-chat` | `2025-10-03` | Text+Image→Text (Preview) | 128K | GlobalStandard |
| `gpt-5-codex` | `2025-09-11` | Text+Image→Text (Codex) | 400K | GlobalStandard |
| `gpt-5-pro` | `2025-10-06` | Text+Image→Text (Reasoning) | 400K | GlobalStandard |
| `gpt-4.1` | `2025-04-14` | Text+Image→Text | 1M (128K std) | GlobalStandard |
| `gpt-4.1-mini` | `2025-04-14` | Text+Image→Text | 1M (128K std) | GlobalStandard |
| `gpt-4.1-nano` | `2025-04-14` | Text+Image→Text | 1M (128K std) | GlobalStandard |
| `o4-mini` | `2025-04-16` | Text+Image→Text (Reasoning) | 200K | GlobalStandard |
| `o3` | `2025-04-16` | Text+Image→Text (Reasoning) | 200K | GlobalStandard |
| `o3-mini` | `2025-01-31` | Text→Text (Reasoning) | 200K | GlobalStandard |
| `o3-pro` | `2025-06-10` | Text+Image→Text (Reasoning) | 200K | GlobalStandard |
| `o1` | `2024-12-17` | Text+Image→Text (Reasoning) | 200K | GlobalStandard |
| `codex-mini` | `2025-05-16` | Text+Image→Text (o4-mini fine-tuned) | 200K | GlobalStandard |
| `gpt-4o` | `2024-11-20` | Text+Image→Text | 128K | GlobalStandard |
| `gpt-4o-mini` | `2024-07-18` | Text+Image→Text | 128K | GlobalStandard |
| `computer-use-preview` | `2025-03-11` | Text+Image→Text (Computer Use) | 8K | GlobalStandard |
| `text-embedding-3-large` | `1` | Text→Embedding (3072 dim) | 8K | GlobalStandard |
| `text-embedding-3-small` | `1` | Text→Embedding (1536 dim) | 8K | GlobalStandard |
| `text-embedding-ada-002` | `2` | Text→Embedding (1536 dim) | 8K | GlobalStandard |
| `dall-e-3` | `3.0` | Text→Image | 4K | Standard |
| `gpt-image-1` | `1` | Text→Image | 4K | GlobalStandard |
| `sora-2` | `1` | Text→Video | - | GlobalStandard |

### Azure OpenAI OSS Models (format: `OpenAI-OSS`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `gpt-oss-120b` | `1` | Text→Text (Reasoning, Preview) | 131K | GlobalStandard |

### DeepSeek Models (format: `DeepSeek`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `DeepSeek-V3.2-Speciale` | `1` | Text→Text (Reasoning) | 128K | GlobalStandard |
| `DeepSeek-V3.2` | `1` | Text→Text (Reasoning) | 128K | GlobalStandard |
| `DeepSeek-V3.1` | `1` | Text→Text (Tool calling) | 131K | GlobalStandard |
| `DeepSeek-V3-0324` | `1` | Text→Text (Tool calling) | 131K | GlobalStandard |
| `DeepSeek-R1-0528` | `1` | Text→Text (Reasoning) | 163K | GlobalStandard |
| `DeepSeek-R1` | `1` | Text→Text (Reasoning) | 163K | GlobalStandard |

### Meta Models (format: `Meta`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `Llama-4-Maverick-17B-128E-Instruct-FP8` | `1` | Text+Image→Text | 1M | GlobalStandard |
| `Llama-3.3-70B-Instruct` | `1` | Text→Text | 128K | GlobalStandard |

### Microsoft Models (format: `Microsoft`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `model-router` | `2025-11-18` | Text+Image→Text (Auto-routing) | 200K | GlobalStandard |
| `MAI-DS-R1` | `1` | Text→Text (Reasoning) | 163K | GlobalStandard |

### Mistral Models (format: `MistralAI`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `Mistral-Large-3` | `1` | Text+Image→Text (Tool calling) | - | GlobalStandard |
| `mistral-document-ai-2505` | `1` | Image/PDF→Text | - | GlobalStandard |

### Cohere Models (format: `Cohere`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `Cohere-command-a` | `1` | Text→Text (Tool calling) | 131K | GlobalStandard |
| `Cohere-rerank-v4.0-pro` | `1` | Text→Text (Rerank) | - | GlobalStandard |
| `Cohere-rerank-v4.0-fast` | `1` | Text→Text (Rerank) | - | GlobalStandard |
| `embed-v-4-0` | `1` | Text+Image→Embedding | 512 | GlobalStandard |

### Moonshot AI Models (format: `Moonshot`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `Kimi-K2.5` | `1` | Text+Image→Text (Reasoning, Tool calling) | 262K | GlobalStandard |
| `Kimi-K2-Thinking` | `1` | Text→Text (Reasoning, Tool calling) | 262K | GlobalStandard |

### xAI Models (format: `xAI`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `grok-4` | `1` | Text→Text (Tool calling) | 262K | GlobalStandard |
| `grok-4-fast-reasoning` | `1` | Text+Image→Text (Tool calling) | 128K | GlobalStandard |
| `grok-4-fast-non-reasoning` | `1` | Text+Image→Text (Tool calling) | 128K | GlobalStandard |
| `grok-code-fast-1` | `1` | Text→Text (Tool calling) | 256K | GlobalStandard |
| `grok-3` | `1` | Text→Text (Tool calling) | 131K | GlobalStandard |
| `grok-3-mini` | `1` | Text→Text (Tool calling) | 131K | GlobalStandard |

### Black Forest Labs Models (format: `BlackForestLabs`)

| Model Name | Version | Modality | Context | SKU |
|------------|---------|----------|---------|-----|
| `FLUX.2-pro` | `1` | Text+Image→Image | - | GlobalStandard |
| `FLUX.1-Kontext-pro` | `1` | Text+Image→Image | - | GlobalStandard |
| `FLUX-1.1-pro` | `1` | Text→Image | - | GlobalStandard |

## Region Availability

### Regions with Maximum Azure OpenAI Model Coverage

These regions have the broadest model availability. Prefer these when needing the widest selection:

| Region | Azure ID | Coverage |
|--------|----------|----------|
| **East US 2** | `eastus2` | **All models** — Best overall coverage. Has every Azure OpenAI model + audio + image + video + codex. |
| **Sweden Central** | `swedencentral` | **Near-complete** — All core models + audio + image + video. Missing only a few niche models vs East US 2. |
| Central US | `centralus` | Good coverage — GPT-5 series, GPT-4.1, o-series, plus some audio models. |

### Regions with Good Azure OpenAI Coverage

These regions support all mainstream models (GPT-5-mini/nano, GPT-4.1 series, o-series, GPT-4o, embeddings):

| Region | Azure ID |
|--------|----------|
| Australia East | `australiaeast` |
| Canada East | `canadaeast` |
| Japan East | `japaneast` |
| Korea Central | `koreacentral` |
| UK South | `uksouth` |
| Switzerland North | `switzerlandnorth` |
| South India | `southindia` |

### Regions with Standard Azure OpenAI Coverage

Support GPT-4.1 series, o-series, GPT-4o, embeddings, but fewer GPT-5 variants:

| Region | Azure ID |
|--------|----------|
| Brazil South | `brazilsouth` |
| East US | `eastus` |
| France Central | `francecentral` |
| Germany West Central | `germanywestcentral` |
| Italy North | `italynorth` |
| North Central US | `northcentralus` |
| Norway East | `norwayeast` |
| Poland Central | `polandcentral` |
| South Africa North | `southafricanorth` |
| South Central US | `southcentralus` |
| Spain Central | `spaincentral` |
| UAE North | `uaenorth` |
| West Europe | `westeurope` |
| West US | `westus` |
| West US 3 | `westus3` |

### Non-Azure-OpenAI Models (DeepSeek, Meta, Cohere, xAI, Mistral, Moonshot, Black Forest Labs)

Most non-OpenAI models sold directly by Azure are available in **all Global Standard regions** listed above. Notable exceptions:
- `Mistral-Large-3`: West US 3 only
- `model-router`: East US 2 and Sweden Central only
- `codex-mini`, `o3-pro`: East US 2 and Sweden Central only

### Registration-Required Models

These models require application approval before use:
- `gpt-5`, `gpt-5-pro`, `gpt-5-codex`, `gpt-5.1`, `gpt-5.1-codex`, `gpt-5.1-codex-max`, `gpt-5.2`, `gpt-5.2-codex`
- `computer-use-preview`
- `gpt-image-1`, `gpt-image-1-mini`, `gpt-image-1.5`
- `grok-code-fast-1`, `grok-4`

Models **not** requiring registration: `gpt-5-mini`, `gpt-5-nano`, `gpt-5-chat`, `gpt-4.1` series, `o4-mini`, `o3`, all DeepSeek, Meta, Cohere, Moonshot, and most xAI models.

## Workflow

1. Ask the user what task/modality they need (chat, reasoning, coding, embeddings, image gen, etc.)
2. Recommend models from "Preferred Models by Task" section above
3. Confirm which region works for them (suggest `eastus2` or `swedencentral` for maximum coverage)
4. Confirm capacity needs (default to 100 for chat models, 30 for embedding models)
5. Run the `azd env set` commands:

```bash
azd env set AZURE_LOCATION "<selected-region>"
azd env set AI_PROJECT_DEPLOYMENTS "[<deployment-entries>]"
```

## Quick-Start Examples

### Basic Chat App
```bash
azd env set AZURE_LOCATION "eastus2"
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-5-mini', 'model': {'name': 'gpt-5-mini','format': 'OpenAI', 'version':'2025-08-07'},'sku': {'name': 'GlobalStandard','capacity':100}}]"
```

### RAG Application (Chat + Embeddings)
```bash
azd env set AZURE_LOCATION "eastus2"
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-5-mini', 'model': {'name': 'gpt-5-mini','format': 'OpenAI', 'version':'2025-08-07'},'sku': {'name': 'GlobalStandard','capacity':100}}, {'name':'text-embedding-3-large', 'model': {'name': 'text-embedding-3-large','format': 'OpenAI', 'version':'1'},'sku': {'name': 'GlobalStandard','capacity':30}}]"
```

### Coding Agent
```bash
azd env set AZURE_LOCATION "eastus2"
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-4.1', 'model': {'name': 'gpt-4.1','format': 'OpenAI', 'version':'2025-04-14'},'sku': {'name': 'GlobalStandard','capacity':100}}, {'name':'o4-mini', 'model': {'name': 'o4-mini','format': 'OpenAI', 'version':'2025-04-16'},'sku': {'name': 'GlobalStandard','capacity':50}}]"
```

### Multi-Provider Setup
```bash
azd env set AZURE_LOCATION "eastus2"
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'gpt-4.1-mini', 'model': {'name': 'gpt-4.1-mini','format': 'OpenAI', 'version':'2025-04-14'},'sku': {'name': 'GlobalStandard','capacity':100}}, {'name':'DeepSeek-R1-0528', 'model': {'name': 'DeepSeek-R1-0528','format': 'DeepSeek', 'version':'1'},'sku': {'name': 'GlobalStandard','capacity':100}}]"
```

### Cost-Optimized with Model Router
```bash
azd env set AZURE_LOCATION "eastus2"
azd env set AI_PROJECT_DEPLOYMENTS "[{'name':'model-router', 'model': {'name': 'model-router','format': 'Microsoft', 'version':'2025-11-18'},'sku': {'name': 'GlobalStandard','capacity':100}}]"
```

## Reference Links

- [Azure OpenAI models](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?view=foundry-classic&pivots=azure-openai)
- [Other model collections (DeepSeek, Meta, xAI, etc.)](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?view=foundry-classic&pivots=azure-direct-others)
- [Deployment types](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/deployment-types?view=foundry-classic)
- [Azure OpenAI pricing](https://aka.ms/aoai-pricing)
