# Pro_Hire_Networks

# Week 1 – LLM APIs, Structured Outputs & Data Validation

## Core Concepts

### 1. LLM API Topologies

LLM applications generally communicate with cloud LLM providers through APIs.

Basic flow:

Application
→ API Request
→ LLM Provider
→ API Response
→ Application

Common providers:

- OpenAI
- Anthropic
- Groq

API requests and responses are generally exchanged using JSON.

---

### 2. Cloud LLM APIs

Important concepts:

- API Key → Authenticates the application
- Endpoint → API URL where request is sent
- Request → Data sent to the LLM
- Response → Data returned by the LLM
- Rate Limit → Maximum number of requests/tokens allowed
- Free Tier → Provider-specific usage limitations

Basic flow:

Python Application
→ API Key
→ Endpoint
→ Request
→ LLM
→ Response

Never expose API keys in GitHub.

---

### 3. Type Enforcement vs Regex Parsing

LLMs generate non-deterministic text.

Regex parsing depends heavily on the exact output format.

Example:

Expected:

```text
Name: Kranthi
Age: 22