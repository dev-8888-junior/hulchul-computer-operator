# Hulchul Computer Operator

A small computer operator prototype for completing customer-support order resolution tasks through a browser.

## What it does

The operator accepts a plain-English business goal such as:

> Please review order #1057 and cancel it if it is eligible.

It then:

1. Interprets the requested task.
2. Identifies the order and intended action.
3. Opens the local customer-support portal using Playwright.
4. Finds the requested order.
5. Performs an allowed action.
6. Verifies the resulting application state.
7. Captures a screenshot as evidence.
8. Requests human approval before issuing a refund.
9. Handles an ambiguous cancellation failure by checking the current order state before attempting any duplicate action.

The support portal uses synthetic customer and order data and runs entirely locally.

## Tech stack

* React + Vite — operator interface
* Node.js + Express — operator API
* Playwright — browser automation
* React + Vite — synthetic support portal
* Express — support portal API
* JSON files — synthetic application data

## Project structure

```text
hulchul-computer-operator/
├── client/                 # Operator UI
├── server/                 # Computer operator backend
│   └── src/
│       ├── server.js
│       └── services/
│           ├── planner.js
│           ├── browser.js
│           ├── operator.js
│           ├── verifier.js
│           └── evidence.js
├── support-app/            # Synthetic customer support application
│   ├── data/
│   │   ├── orders.json
│   │   ├── customers.json
│   │   └── policies.json
│   └── server/
└── evidence/               # Generated execution screenshots
```

## Requirements

* Node.js
* npm
* Chromium installed through Playwright

## Setup

From the project root:

### 1. Install operator backend dependencies

```bash
cd server
npm install
npx playwright install chromium
```

### 2. Install operator frontend dependencies

```bash
cd ../client
npm install
```

### 3. Install support portal dependencies

```bash
cd ../support-app
npm install
```

## Running the application

Three processes are required.

### Terminal 1 — Support portal API

From the project root:

```bash
cd support-app
node server/server.js
```

The API runs on:

```text
http://localhost:4000
```

### Terminal 2 — Support portal frontend

From the project root:

```bash
cd support-app
npm run dev
```

The support portal runs on:

```text
http://localhost:5173
```

### Terminal 3 — Operator backend

From the project root:

```bash
cd server
node src/server.js
```

The operator API runs on:

```text
http://localhost:5000
```

### Terminal 4 — Operator frontend

From the project root:

```bash
cd client
npm run dev -- --port 5174
```

The operator UI runs on:

```text
http://localhost:5174
```

## Example tasks

### Cancellation

```text
Please review order #1057 and cancel it if it is eligible.
```

### Refund with human approval

```text
Please issue a refund for order #1063.
```

The operator stops before executing the refund and asks the user for approval.

### Ineligible request

```text
Review order #1042. Cancel it and issue a refund.
```

The operator does not assume that the requested action is possible when the support portal does not provide the required action.

## Failure handling

The support portal includes a controlled test endpoint for simulating an ambiguous cancellation failure:

```bash
curl -X POST http://localhost:4000/api/test/fail-next-cancellation
```

The next cancellation changes the order state but returns a temporary failure response.

The operator does not blindly retry the cancellation. Instead, it checks the current order state first. If the order is already cancelled, it treats the operation as successfully recovered and avoids a duplicate action.

## Evidence

Successful executions generate screenshots in:

```text
evidence/
```

For example:

```text
evidence/order-1057-result.png
```

## Notes

This is a controlled prototype using synthetic data. It does not send real customer messages, access production systems, or process real payments.

The current planner is intentionally constrained to a small set of supported customer-support actions rather than allowing the model to generate arbitrary browser code.

Future improvements could include a production LLM planner, stronger policy retrieval, persistent execution logs, richer approval controls, and additional recovery strategies.
