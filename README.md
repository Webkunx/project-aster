# Project Aster - API Gateway for distributed systems

## Features
- Schema Update in Runtime
- Fast and technology agnostic validation which can be defined anywhere
- Request flow definition
  - Request aggregation from multiple services
  - Pipeline of requests with passing data from prev requests
  - Multiple Async Parallel Requests 
- Extendible via Plugins - you can add anything into your request flow, like authorization, cache, idempotency

## Improvment Plan
- Add Pino Logger
- Add Undici
- Change EventEmitter to Global Variable to improve performance
- Add proper config management and remove consts
- Resolve all comments
- Listen to schema updates via Kafka
- Add fetching of schemas from S3
- Add Plugin System
- Add Rate Limiting with Compacting Sliding Window
- Add k8s setup
- Add WS
- Add Log Analytics
- Add Metrics