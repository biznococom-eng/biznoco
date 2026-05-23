// Run Supabase SQL migration via Management API
// Usage: node scripts/run-migration.mjs <sql-file>
import fs from "node:fs";
import path from "node:path";

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF;
if (!PAT || !REF) {
  console.error("Need env SUPABASE_PAT + SUPABASE_PROJECT_REF");
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node run-migration.mjs <sql-file>");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(sqlFile), "utf8");
console.log(`File: ${sqlFile} (${sql.length} chars)`);

const endpoint = `https://api.supabase.com/v1/projects/${REF}/database/query`;
const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${PAT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
console.log(`Status: ${res.status}`);
console.log(`Body: ${text.slice(0, 2000)}`);
process.exit(res.ok ? 0 : 1);
