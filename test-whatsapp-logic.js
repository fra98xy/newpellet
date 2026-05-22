// Test suite for WhatsApp (Green API) integration logic
const assert = require('assert');

function formatWhatsAppPhone(phone) {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith("3")) {
    cleaned = "39" + cleaned;
  } else if (cleaned.length === 9 && cleaned.startsWith("3")) {
    cleaned = "39" + cleaned;
  }
  return cleaned;
}

function buildMessageText(customerName, orderId, total, customerAddress) {
  const paddedId = orderId.toString().padStart(6, '0');
  return `Ciao ${customerName}! 🌿\nIl tuo ordine su *Newpellet* è stato preso in carico con successo.\n\n*Riepilogo Ordine:*\n- *Numero:* #${paddedId}\n- *Totale indicativo:* ${total}\n- *Indirizzo di consegna:* ${customerAddress}\n\nGrazie per averci scelto! A presto.`;
}

// Run test cases
console.log("Running unit tests for WhatsApp Integration Logic...");

try {
  // Test case 1: Phone number cleaning and formatting
  assert.strictEqual(formatWhatsAppPhone("3289361775"), "393289361775", "Should prepend 39 to standard Italian 10-digit number starting with 3");
  assert.strictEqual(formatWhatsAppPhone("+39 328 9361775"), "393289361775", "Should strip non-digits and keep existing 39");
  assert.strictEqual(formatWhatsAppPhone("0039 328 9361775"), "393289361775", "Should strip leading 00 and keep 39");
  assert.strictEqual(formatWhatsAppPhone("328 936 1775"), "393289361775", "Should strip internal spaces and prepend 39");
  assert.strictEqual(formatWhatsAppPhone("+393289361775"), "393289361775", "Should handle fully clean with plus prefix");
  console.log("✅ Phone number formatting tests passed.");

  // Test case 2: Message construction
  const msg = buildMessageText("Mario Rossi", 42, "€ 476,00", "Via Roma 1, Cona VE");
  const expectedMsg = `Ciao Mario Rossi! 🌿\nIl tuo ordine su *Newpellet* è stato preso in carico con successo.\n\n*Riepilogo Ordine:*\n- *Numero:* #000042\n- *Totale indicativo:* € 476,00\n- *Indirizzo di consegna:* Via Roma 1, Cona VE\n\nGrazie per averci scelto! A presto.`;
  assert.strictEqual(msg, expectedMsg, "Message structure must be constructed exactly as required");
  console.log("✅ Message construction tests passed.");

  console.log("🎉 All WhatsApp integration tests passed successfully!");
} catch (error) {
  console.error("❌ Unit tests failed:");
  console.error(error);
  process.exit(1);
}
