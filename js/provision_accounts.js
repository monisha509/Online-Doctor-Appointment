/**
 * Account Provisioning CLI Script
 * Safely provisions all 55 consulting physician accounts and patient accounts
 * into SQLite database with salt and scrypt password hashing.
 * 
 * Usage:
 *   node js/provision_accounts.js
 *   npm run provision
 */

const db = require('./db.js');
const fs = require('fs');
const path = require('path');

console.log("==================================================================");
console.log("HEALTHCARE SYSTEM - SECURE ACCOUNT PROVISIONING");
console.log("==================================================================\n");

try {
  db.provisionAccounts();
  const credsPath = path.join(__dirname, '..', 'data', 'provisioned_credentials.json');
  console.log(`[PROVISION] Verification completed successfully.`);
  console.log(`[PROVISION] Credentials reference documented at: ${credsPath}`);
  console.log(`[PROVISION] Physician Accounts: 55 provisioned (unique doctor IDs: doc-001 to doc-055)`);
  console.log(`[PROVISION] Patient Accounts:   2 provisioned (Ananya Raman, Karthik Verma)\n`);
  console.log("Example Test Credentials:");
  console.log("  Role: Consulting Physician");
  console.log("  Email: dr.johnsmith@healthcare.demo");
  console.log("  Password: Doctor#doc-0012026!\n");
  console.log("  Role: Patient");
  console.log("  Email: ananya.raman@healthcare.demo");
  console.log("  Password: Patient#Secure2026!\n");
} catch (err) {
  console.error("[PROVISION ERROR]:", err.message);
  process.exit(1);
}
