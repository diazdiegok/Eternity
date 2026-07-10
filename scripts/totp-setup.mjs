import "dotenv/config";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

const envPath = resolve(process.cwd(), ".env");
const issuer = "Eternity Recuerdos";
const label = "Admin";

let secret = process.env.ADMIN_TOTP_SECRET?.trim();

if (!secret) {
  secret = generateSecret();
  const line = `ADMIN_TOTP_SECRET="${secret}"`;

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    if (/^ADMIN_TOTP_SECRET=/m.test(content)) {
      writeFileSync(
        envPath,
        content.replace(/^ADMIN_TOTP_SECRET=.*$/m, line),
        "utf8"
      );
    } else {
      writeFileSync(envPath, `${content.trimEnd()}\n\n# Autenticador (Microsoft Authenticator)\n${line}\n`, "utf8");
    }
  } else {
    writeFileSync(envPath, `${line}\n`, "utf8");
  }

  console.log("✓ ADMIN_TOTP_SECRET guardado en .env\n");
} else {
  console.log("Usando ADMIN_TOTP_SECRET existente en .env\n");
}

const uri = generateURI({ issuer, label, secret });
const qrPath = resolve(process.cwd(), "totp-qr.png");

await QRCode.toFile(qrPath, uri, { width: 320, margin: 2 });

console.log("Escaneá este QR con Microsoft Authenticator:");
console.log(`  Archivo: ${qrPath}`);
console.log(`  URL: ${uri}\n`);
console.log("En Render, agregá la misma variable ADMIN_TOTP_SECRET en el panel de variables.");
