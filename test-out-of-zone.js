const assert = require('assert');

// Simulate the frontend/backend distance validation logic
function validateDistance(distance) {
  if (distance === "oltre100") {
    return {
      allowed: false,
      message: "Mi dispiace ma siamo fuori zona"
    };
  }
  return {
    allowed: true,
    message: "Ok"
  };
}

console.log("Running out-of-zone validation unit tests...");

try {
  // Test case 1: 'entro80' should be allowed
  const result1 = validateDistance("entro80");
  assert.strictEqual(result1.allowed, true);
  assert.strictEqual(result1.message, "Ok");
  console.log("✅ Case 'entro80' passed.");

  // Test case 2: 'oltre80' should be allowed
  const result2 = validateDistance("oltre80");
  assert.strictEqual(result2.allowed, true);
  assert.strictEqual(result2.message, "Ok");
  console.log("✅ Case 'oltre80' passed.");

  // Test case 3: 'oltre100' should NOT be allowed and should return the exact error message
  const result3 = validateDistance("oltre100");
  assert.strictEqual(result3.allowed, false);
  assert.strictEqual(result3.message, "Mi dispiace ma siamo fuori zona");
  console.log("✅ Case 'oltre100' successfully blocked with correct message.");

  console.log("🎉 All out-of-zone validation tests passed successfully!");
} catch (error) {
  console.error("❌ Out-of-zone validation tests failed:");
  console.error(error);
  process.exit(1);
}
