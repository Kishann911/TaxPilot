# TaxPilot Next.js Serverless Redesign & Architecture Suite

> **Official Engineering & Product Documentation for AY 2026-27 (FY 2025-26)**  
> *Deterministic Indian Income Tax Engine & AI Filing Co-Pilot*  
> *Maintained & Owned by Kishan Ojha (`Kishann911/TaxPilot`)*

---

## 📑 Documentation Directory

This directory contains the comprehensive architectural analysis, design specifications, feature roadmap, and deployment strategies for transforming TaxPilot into an enterprise-grade, serverless Next.js web application.

| Document | Focus & Content |
| :--- | :--- |
| **[1. System Architecture Analysis](SYSTEM_ANALYSIS.md)** | Full codebase audit, component-by-component breakdown, mathematical rigor assessment, and a 10-point discrepancy audit between the Python core and the legacy JS frontend. |
| **[2. Frontend Redesign Specification](REDESIGN_SPECIFICATION.md)** | Fintech-grade UI/UX overhaul, design tokens, typography, glassmorphism, responsive dual-pane layout, data visualizers, and accessibility standards. |
| **[3. Feature Roadmap & Specifications](FEATURE_ROADMAP.md)** | High-leverage additions: Client-side Form 16 PDF dropzone, AIS JSON parser, Regime Break-Even Radar, Multi-broker Capital Gains consolidator, and CA-grade Master Tax Sheet export. |
| **[4. Serverless Next.js Architecture](SERVERLESS_NEXTJS_ARCHITECTURE.md)** | Technical blueprint for Next.js 16 App Router, TypeScript engine parity, state machines, Edge API routes, and zero-trust PII privacy architecture. |
| **[5. Fast-Track Implementation Plan](FAST_TRACK_IMPLEMENTATION_PLAN.md)** | Multi-agent execution model, day-by-day sprint schedule, automated golden test verification, and zero-error CI/CD deployment guide. |

---

## 🎯 Executive Summary & Vision

TaxPilot addresses a fundamental problem in AI-assisted tax filing: **LLMs are probabilistic and must never compute statutory tax figures.** TaxPilot establishes an unyielding division of labor:
1. **AI / Parser Layer:** Ingests unstructured and structured documents (Form 16, AIS JSON, broker P&L) into a strictly validated schema.
2. **Deterministic Engine:** Computes every single rupee of slab tax, 87A rebate & marginal relief, surcharge caps, cess, and 234A/B/C statutory interest.
3. **User Sovereignty:** The taxpayer reviews the exact computation, downloads the audit pack, and files directly on the government portal.

The goal of this redesign is to replace the legacy single-page static HTML with a **blazing-fast, visually stunning, 100% serverless Next.js web application** that guarantees zero arithmetic drift, zero server maintenance costs, and unmatched user delight.
