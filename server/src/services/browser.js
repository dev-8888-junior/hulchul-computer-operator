const { chromium } = require("playwright");

async function openSupportPortal() {
const browser = await chromium.launch({
headless: false
});

const page = await browser.newPage();

await page.goto("http://localhost:5173", {
waitUntil: "domcontentloaded"
});

await page.getByText("Customer Support Portal", {
exact: true
}).waitFor({
state: "visible",
timeout: 10000
});

return {
browser,
page
};
}

async function findOrder(page, orderId) {
const orderText = page.getByText(`Order #${orderId}`, {
exact: true
}).first();

await orderText.waitFor({
state: "visible",
timeout: 10000
});

await orderText.scrollIntoViewIfNeeded();

const card = orderText.locator("..");

const viewButton = card.getByRole("button", {
name: "View Order"
});

if (await viewButton.count() === 0) {
throw new Error(
`View Order button for order #${orderId} was not found.`
);
}

await viewButton.click();

const orderDetails = page.getByText(`Order #${orderId}`, {
exact: true
}).last();

await orderDetails.waitFor({
state: "visible",
timeout: 10000
});

return orderDetails;
}

async function reopenOrderAfterRecovery(page, orderId) {
const orderText = page.getByText(`Order #${orderId}`, {
exact: true
}).first();

await orderText.waitFor({
state: "visible",
timeout: 10000
});

await orderText.scrollIntoViewIfNeeded();

const card = orderText.locator("..");

const viewButton = card.getByRole("button", {
name: "View Order"
});

if (await viewButton.count() === 0) {
throw new Error(
`View Order button for order #${orderId} was not found during recovery.`
);
}

await viewButton.click();

await page.getByText(`Order #${orderId}`, {
exact: true
}).last().waitFor({
state: "visible",
timeout: 10000
});
}

async function cancelOrder(page, orderId) {
const cancelButton = page.getByRole("button", {
name: "Cancel Order"
});

if (await cancelButton.count() === 0) {
throw new Error("Cancel Order button is not available.");
}

try {
await cancelButton.click();


await page.getByText("Status: cancelled").last().waitFor({
  state: "visible",
  timeout: 5000
});

return {
  success: true,
  recovered: false
};


} catch (error) {
console.log(
"Cancellation action reported a failure. Checking the current order state before retrying..."
);


const stateResponse = await page.request.get(
  `http://localhost:4000/api/orders/${orderId}`
);

if (stateResponse.ok()) {
  const currentOrder = await stateResponse.json();

  if (currentOrder.status === "cancelled") {
    await page.reload();

    await reopenOrderAfterRecovery(page, orderId);

    await page.getByText("Status: cancelled").last().waitFor({
      state: "visible",
      timeout: 5000
    });

    return {
      success: true,
      recovered: true,
      message:
        "The cancellation request reported a failure, but verification showed that the order was already cancelled. No duplicate action was attempted."
    };
  }
}

throw new Error(
  `Cancellation failed and the order was not cancelled. ${error.message}`
);


}
}

async function refundOrder(page) {
const refundButton = page.getByRole("button", {
name: "Issue Refund"
});

if (await refundButton.count() === 0) {
throw new Error("Issue Refund button is not available.");
}

await refundButton.click();

await page.getByText("Refund issued successfully").waitFor({
state: "visible",
timeout: 5000
});
}

module.exports = {
openSupportPortal,
findOrder,
cancelOrder,
refundOrder
};
