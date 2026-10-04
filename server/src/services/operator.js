const { createPlan } = require("./planner");

const {
  openSupportPortal,
  findOrder,
  cancelOrder,
  refundOrder
} = require("./browser");

const {
  verifyCancellation,
  verifyRefund
} = require("./verifier");

const { captureEvidence } = require("./evidence");

async function executePlan(plan) {
  let browser;

  try {
    const portal = await openSupportPortal();
    browser = portal.browser;

    const { page } = portal;

    await findOrder(page, plan.orderId);

    if (plan.action === "cancel_order") {
      await cancelOrder(page);

      const verification = await verifyCancellation(
        page,
        plan.orderId
      );

      if (!verification.verified) {
        return {
          success: false,
          stage: "verification",
          error: verification.reason,
          plan
        };
      }

      const evidencePath = await captureEvidence(
        page,
        plan.orderId
      );

      return {
        success: true,
        plan,
        verification,
        evidencePath
      };
    }

    if (plan.action === "refund_request") {
      await refundOrder(page);

      const verification = await verifyRefund(
        page,
        plan.orderId
      );

      if (!verification.verified) {
        return {
          success: false,
          stage: "verification",
          error: verification.reason,
          plan
        };
      }

      const evidencePath = await captureEvidence(
        page,
        plan.orderId
      );

      return {
        success: true,
        plan,
        verification,
        evidencePath
      };
    }

    return {
      success: false,
      stage: "execution",
      error: `Unsupported action: ${plan.action}`,
      plan
    };
  } catch (error) {
    return {
      success: false,
      stage: "execution",
      error: error.message,
      plan
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function executeGoal(goal) {
  const planningResult = createPlan(goal);

  if (!planningResult.success) {
    return {
      success: false,
      stage: "planning",
      error: planningResult.error
    };
  }

  const { plan } = planningResult;

  if (plan.requiresApproval) {
    return {
      success: false,
      stage: "approval",
      requiresApproval: true,
      message: `Refund action for order #${plan.orderId} requires your approval before the operator can proceed.`,
      plan
    };
  }

  return executePlan(plan);
}

async function executeApprovedPlan(plan) {
  if (!plan || !plan.orderId || !plan.action) {
    return {
      success: false,
      stage: "approval",
      error: "A valid plan is required."
    };
  }

  return executePlan(plan);
}

module.exports = {
  executeGoal,
  executeApprovedPlan
};