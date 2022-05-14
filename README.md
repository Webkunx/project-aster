# Project Aster - API Gateway for distributed systems

## Implementation Plan

1. Implement MVP, which includes:
   1. Ability to work on:
      1. Kafka
      2. Undici HTTP client
   2. Ability to work with schemas in runtime:
      1. Add ability to add schema in runtime
      2. Add ability to change schema in runtime
   3. Ability to have multiple handlers in desired order - We need it to be able to authenticate request for example.
   4. Implement minimal needed metrics and logs for better observability:
      1. Add Pino Logger
      2. Add Analytics tool for logs (some OS project like Coralogix)
      3. Add Metrics tool for monitoring - CPU, RAM, RPS, RPS per pod, Event Loop Delay
   5. Implement CI/CD tools:
      1. Run Unit tests for each PR.
      2. Generate COV report for each PR (on GH pages?).
      3. Deploy for each PR.
