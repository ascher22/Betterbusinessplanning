import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const scrapeDir = path.join(
  root,
  "..",
  "scraped_data",
  "account.meritain.com",
  "account_meritain_com__2026-08-05T16-34-12-301Z_images",
);

const COPIES = [
  { from: "asset-0_logo-new.png", to: ["public/brand/logo.png"] },
  { from: "asset-2_lifestyle_new.jpg", to: ["public/brand/lifestyle.jpg"] },
  { from: "asset-8_Cvshealthsans_w_rg.woff", to: ["public/fonts/cvs-sans-regular.woff"] },
  { from: "asset-9_Cvshealthsans_w_rg.woff2", to: ["public/fonts/cvs-sans-regular.woff2"] },
  { from: "asset-6_Cvshealthsanscd_w_bd.woff", to: ["public/fonts/cvs-sans-cond-bold.woff"] },
  { from: "asset-7_Cvshealthsanscd_w_bd.woff2", to: ["public/fonts/cvs-sans-cond-bold.woff2"] },
];

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  await fs.writeFile(dest, Buffer.from(await response.arrayBuffer()));
}

async function copyIfPresent(fromRel, destRel) {
  const source = path.join(scrapeDir, fromRel);
  const dest = path.join(root, destRel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const stat = await fs.stat(source).catch(() => null);
  if (!stat) {
    console.warn(`Missing scrape asset: ${fromRel}`);
    return false;
  }
  await fs.copyFile(source, dest);
  console.log(`Copied ${fromRel} -> ${destRel}`);
  return true;
}

for (const item of COPIES) {
  for (const dest of item.to) {
    await copyIfPresent(item.from, dest);
  }
}

const faviconDest = path.join(root, "app", "favicon.ico");
const brandFavicon = path.join(root, "public", "brand", "favicon.ico");
await fs.mkdir(path.dirname(brandFavicon), { recursive: true });
try {
  await downloadFile("https://account.meritain.com/images/favicon.ico", brandFavicon);
  await fs.copyFile(brandFavicon, faviconDest);
  console.log("Downloaded favicon.ico");
} catch (error) {
  console.warn(`Favicon download skipped: ${error instanceof Error ? error.message : error}`);
}

console.log("meritain-app brand assets synced.");
