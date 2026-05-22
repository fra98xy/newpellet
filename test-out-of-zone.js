const assert = require('assert');

// Simulate the updated frontend/backend distance validation and notification logic
function processOrderDistanceAndGetMessage(distance) {
  if (distance === "oltre100") {
    return {
      allowed: true, // We allow registering the order so the owner has a record and can send automated notifications
      message: "Mi dispiace ma siamo fuori zona non possiamo eseguire la consegna"
    };
  }
  return {
    allowed: true,
    message: "Grazie per il tuo ordine. È stato preso in carico a breve verrai contattato dal nostro team per eventuali informazioni su data di consegna e orario"
  };
}

console.log("Running updated out-of-zone validation unit tests...");

try {
  // Test case 1: 'entro80' should be allowed and return the standard order confirmation message
  const result1 = processOrderDistanceAndGetMessage("entro80");
  assert.strictEqual(result1.allowed, true);
  assert.strictEqual(result1.message, "Grazie per il tuo ordine. È stato preso in carico a breve verrai contattato dal nostro team per eventuali informazioni su data di consegna e orario");
  console.log("✅ Case 'entro80' passed with correct success message.");

  // Test case 2: 'oltre80' should be allowed and return the standard order confirmation message
  const result2 = processOrderDistanceAndGetMessage("oltre80");
  assert.strictEqual(result2.allowed, true);
  assert.strictEqual(result2.message, "Grazie per il tuo ordine. È stato preso in carico a breve verrai contattato dal nostro team per eventuali informazioni su data di consegna e orario");
  console.log("✅ Case 'oltre80' passed with correct success message.");

  // Test case 3: 'oltre100' should be allowed but return the exact out-of-zone WhatsApp message
  const result3 = processOrderDistanceAndGetMessage("oltre100");
  assert.strictEqual(result3.allowed, true);
  assert.strictEqual(result3.message, "Mi dispiace ma siamo fuori zona non possiamo eseguire la consegna");
  console.log("✅ Case 'oltre100' successfully allowed to submit and returned out-of-zone message.");

  console.log("🎉 All updated out-of-zone validation tests passed successfully!");
} catch (error) {
  console.error("❌ Updated out-of-zone validation tests failed:");
  console.error(error);
  process.exit(1);
}
