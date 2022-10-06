# Project Aster - API Gateway for distributed systems

This inovative API GateWay allows systems to improve their experience with Distributed Systems by solving all transport, routing, validation, authorization, request aggregation, metric and even transaction isolation problems.

## Features
- Schema Update in Runtime
- Can work with gRPC, Kafka, HTTP and any other transport.
- Forget about transactions in DB - **Astera can achieve Serializability** per defined entity id using RPC via Kafka.
- Fast and technology agnostic validation which can be defined anywhere
- Request flow definition
  - Request aggregation from multiple services
  - Pipeline of requests with passing data from prev requests
  - Multiple Async Parallel Requests 
- Extendible via Plugins - you can add anything into your request flow, like authorization, cache, idempotency

## Improvment Plan
- Add Pino Logger :white_check_mark:
- Add Undici
- Add gRPC
- Change EventEmitter to Global Variable to improve performance
- Add proper config management and remove consts
- Resolve all comments
- Listen to schema updates via Kafka
- Add fetching of schemas from S3
- Add Plugin System
- Ask Community about improvments
- Add Rate Limiting with Compacting Sliding Window
- Add k8s setup
- Add WS
- Add Log Analytics
- Add Metrics