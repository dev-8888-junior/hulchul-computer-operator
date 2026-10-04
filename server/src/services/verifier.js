async function verifyCancellation(page, orderId) {
  const statusText = page.locator("text=Status: cancelled");

  if (await statusText.count() === 0) {
    return {
      verified: false,
      reason: `Order #${orderId} does not show a cancelled status.`
    };
  }

  return {
    verified: true,
    reason: `Order #${orderId} is visibly marked as cancelled in the support portal.`
  };
}

async function verifyRefund(page, orderId) {
  const refundMessage = page.getByText("Refund issued successfully");

  if (await refundMessage.count() === 0) {
    return {
      verified: false,
      reason: `Order #${orderId} does not show a successful refund confirmation.`
    };
  }

  return {
    verified: true,
    reason: `Refund for order #${orderId} is visibly confirmed in the support portal.`
  };
}

module.exports = {
  verifyCancellation,
  verifyRefund
};