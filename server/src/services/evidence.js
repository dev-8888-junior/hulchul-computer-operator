const fs = require("fs");
const path = require("path");

async function captureEvidence(page, orderId) {
  const evidenceDir = path.join(__dirname, "..", "..", "..", "evidence");

  fs.mkdirSync(evidenceDir, { recursive: true });

  const filePath = path.join(
    evidenceDir,
    `order-${orderId}-result.png`
  );

  await page.screenshot({
    path: filePath,
    fullPage: true
  });

  return filePath;
}

module.exports = {
  captureEvidence
};