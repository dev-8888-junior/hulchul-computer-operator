function createPlan(goal) {
  const orderMatch = goal.match(/(?:order|#)\s*#?(\d+)/i);

  if (!orderMatch) {
    return {
      success: false,
      error: "I could not identify an order number from the goal."
    };
  }

  const orderId = orderMatch[1];

  const wantsCancel = /cancel/i.test(goal);
  const wantsRefund = /refund/i.test(goal); 
  if (wantsCancel && wantsRefund) {
  return {
    success: true,
    plan: {
      orderId,
      action: "refund_request",
      requiresApproval: true,
      originalGoal: goal
    }
  };
}

  if (!wantsCancel && !wantsRefund) {
    return {
      success: false,
      error: "I could not identify a supported action. The operator currently supports cancellation and refund requests."
    };
  }

  return {
    success: true,
    plan: {
      orderId,
      action: wantsCancel ? "cancel_order" : "refund_request",
      requiresApproval: wantsRefund,
      originalGoal: goal
    }
  };
}

module.exports = {
  createPlan
};