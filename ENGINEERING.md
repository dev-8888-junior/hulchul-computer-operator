# Engineering Note

## 1. Problem and approach

The goal was to build a small computer operator that can take a plain-English business request and complete a meaningful task through an application.

I chose a customer-support order-resolution workflow because it provides several useful operator behaviors in a small controlled environment:

* Finding information in an application
* Making a business decision based on order state
* Performing an action through the UI
* Handling actions that require human approval
* Verifying the final state
* Producing evidence
* Handling an ambiguous failure without blindly repeating an action

The prototype uses a synthetic customer-support portal so the workflow can be tested safely without real customer data or external accounts.

## 2. Architecture

The system has three main parts:

### Operator UI

A React application accepts the user's plain-English goal and displays:

* Execution progress/result
* Identified order
* Planned action
* Approval requests
* Verification result
* Evidence location

### Operator backend

The Node.js/Express backend coordinates the workflow.

The main flow is:

```text
Plain-English goal
        ↓
Planner
        ↓
Structured action
        ↓
Permission / approval check
        ↓
Playwright browser automation
        ↓
Application state change
        ↓
Verification
        ↓
Evidence screenshot
```

The planner currently produces a constrained structured plan rather than arbitrary browser code.

Example:

```json
{
  "orderId": "1057",
  "action": "cancel_order",
  "requiresApproval": false
}
```

This keeps browser execution deterministic and limits what the operator can do.

### Synthetic support portal

The support application represents a simple customer-support system containing:

* Orders
* Customers
* Cancellation policy
* Refund policy

The data is stored locally in JSON files.

## 3. Human control

Refunds are treated as a higher-authority action.

When a goal requires a refund, the operator stops before executing it and asks the user for approval.

The user can:

* Approve the action
* Reject the action

The approved plan is then passed back to the operator for execution.

This prevents the operator from silently performing a higher-impact action.

## 4. Verification and evidence

The operator does not treat a successful browser click as proof that the task is complete.

After an action, it checks the resulting application state.

For cancellation, the operator verifies that the order visibly shows:

```text
Status: cancelled
```

For refunds, it verifies that the support portal shows the successful refund confirmation.

A screenshot is then captured and stored in the `evidence/` directory.

## 5. Failure handling

A controlled failure was added to the support portal to simulate an ambiguous real-world situation.

The cancellation can be processed by the support system while the response to the browser reports a temporary failure.

The operator therefore does not immediately repeat the cancellation.

Instead, it queries the current order state.

If the order is already cancelled, the operator treats the task as recovered and reports that no duplicate action was attempted.

This is important because retrying an action without checking state could result in duplicate or unintended business actions in a real system.

## 6. Adaptability

The operator accepts natural-language variations without requiring a code change.

For example, these requests can resolve to the same cancellation action:

```text
Please review order #1057 and cancel it if it is eligible.
```

and:

```text
Review order 1057 and cancel it.
```

The order number and requested action are extracted from the goal and converted into a structured plan.

## 7. Why browser automation

Playwright was chosen because the assignment specifically asks for a computer operator that can operate applications.

Using browser automation makes the execution observable:

* The browser opens visibly.
* The operator navigates the support application.
* The order is selected.
* The action is performed through the application.
* The final state can be visually verified.

This also makes the behavior easy to demonstrate during the walkthrough.

## 8. Reliability decisions

A few decisions were made to keep the prototype trustworthy:

* The planner supports a limited action set rather than arbitrary generated code.
* Refunds require explicit approval.
* Actions are followed by verification.
* Ambiguous cancellation failures trigger a state check before any retry.
* Synthetic data is used throughout the workflow.
* Evidence is captured after successful completion.

## 9. Personal contribution

I designed the workflow, selected the architecture, implemented the React interfaces and Node.js APIs, built the browser automation with Playwright, created the synthetic support application and test data, implemented approval handling, verification, evidence capture, and the controlled failure/recovery scenario.

AI assistance was used during development for brainstorming, debugging support, and reviewing implementation approaches. The application behavior, workflow decisions, integration, testing, and final implementation were assembled and validated as part of this assignment.

## 10. Limitations

This is intentionally a prototype rather than a production customer-support automation system.

Current limitations include:

* The planner supports a small set of actions.
* The support portal is synthetic and local.
* Policies are represented as local JSON data.
* There is no production authentication or authorization system.
* Execution history is not persisted in a database.
* Recovery currently focuses on the demonstrated cancellation scenario.
* The system does not send real customer communications.
* There are no production-grade distributed locks or idempotency keys.

## 11. What I would build next

For a production version, I would prioritize:

1. A stronger LLM-based planner that outputs validated structured actions.
2. Explicit policy retrieval and policy-aware decision making.
3. Persistent execution and audit logs.
4. Idempotency keys for actions that can change business state.
5. More comprehensive recovery strategies for browser, network, and application failures.
6. Fine-grained permissions for different action types.
7. A richer approval interface showing the exact action, affected order, and potential impact.
8. Automated end-to-end tests covering different order states and failure modes.

## 12. Scope decision

The prototype intentionally focuses on reliable execution rather than adding a large number of unrelated features.

The main goal was to demonstrate that an operator can:

```text
Understand → Act → Verify → Provide Evidence
```

while maintaining human control for higher-impact actions and avoiding unsafe duplicate operations.
