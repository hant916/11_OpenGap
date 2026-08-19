# ADR-0001 — One application, no platform

## Status
Accepted for hackathon MVP.

## Decision
Use one Next.js application with one internal API route and a small OpenAIRE provider module.

## Why
The product value is the evidence-backed research-gap decision shortcut. Additional services, queues, databases and orchestration do not improve the demo enough to justify deadline risk.

## Consequence
Some code may be less abstract than a long-lived platform. This is intentional.
