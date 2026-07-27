const baseUrl = (process.env.KALLIOM_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const secret = process.env.CRON_SECRET;
const intervalMs = Math.max(30_000, Number(process.env.LINKEDIN_POLL_INTERVAL_MS || 60_000));

if (!secret) {
  console.error("Falta CRON_SECRET. Usa el mismo valor configurado en la aplicación.");
  process.exit(1);
}

async function dispatch() {
  try {
    const response = await fetch(`${baseUrl}/api/linkedin/dispatch`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    const published = result.published?.length || 0;
    const failures = result.failures?.length || 0;
    if (result.checked || failures) {
      console.log(`[${new Date().toISOString()}] revisadas=${result.checked} publicadas=${published} errores=${failures}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${error instanceof Error ? error.message : "Error de despacho"}`);
  }
}

console.log(`Despachador LinkedIn activo: ${baseUrl} cada ${Math.round(intervalMs / 1000)} segundos.`);
await dispatch();
setInterval(dispatch, intervalMs);
