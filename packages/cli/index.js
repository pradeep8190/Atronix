#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Atronix Signature Colors (ANSI Escape Codes)
const RED = '\x1b[38;2;255;117;140m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/pradeep8190/Atronix/main/public/r';

function printBanner() {
  console.log(`\n${RED}${BOLD}  ▲ ATRONIX UI${RESET} ${DIM}— Physical Realism for the Modern Web${RESET}\n`);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} at ${url}`));
      }
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function detectTargetDir() {
  const cwd = process.cwd();
  // Next.js / Vite / React directory conventions
  if (fs.existsSync(path.join(cwd, 'src', 'components'))) {
    return path.join(cwd, 'src', 'components', 'ui');
  }
  if (fs.existsSync(path.join(cwd, 'components'))) {
    return path.join(cwd, 'components', 'ui');
  }
  if (fs.existsSync(path.join(cwd, 'src'))) {
    return path.join(cwd, 'src', 'components', 'ui');
  }
  return path.join(cwd, 'components', 'ui');
}

function detectPackageManager() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

async function handleAdd(componentId) {
  if (!componentId) {
    console.error(`${YELLOW}Please specify a component to add.${RESET}\n`);
    console.log(`Example: ${BOLD}npx atronix add orbit-globe${RESET}\n`);
    process.exit(1);
  }

  const cleanId = componentId.toLowerCase().trim();
  console.log(`${DIM}Fetching component definition for ${RESET}${BOLD}${cleanId}${RESET}...`);

  let registryItem;
  const localFallback = path.join(process.cwd(), 'public', 'r', `${cleanId}.json`);
  const repoFallback = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/r', `${cleanId}.json`);

  if (fs.existsSync(localFallback)) {
    registryItem = JSON.parse(fs.readFileSync(localFallback, 'utf-8'));
  } else if (fs.existsSync(repoFallback)) {
    registryItem = JSON.parse(fs.readFileSync(repoFallback, 'utf-8'));
  } else {
    try {
      const url = `${GITHUB_RAW_BASE}/${cleanId}.json`;
      registryItem = await fetchJson(url);
    } catch (err) {
      console.error(`\n${RED}✖ Error:${RESET} Component "${cleanId}" not found in Atronix registry.`);
      console.log(`Run ${BOLD}npx atronix list${RESET} to see all available components.\n`);
      process.exit(1);
    }
  }

  const targetUiDir = detectTargetDir();
  if (!fs.existsSync(targetUiDir)) {
    fs.mkdirSync(targetUiDir, { recursive: true });
  }

  console.log(`\n${GREEN}✔${RESET} Found ${BOLD}${registryItem.title}${RESET}`);

  // Write component files
  for (const file of registryItem.files) {
    let relPath = file.target || file.path;
    if (relPath.startsWith('components/ui/')) {
      relPath = relPath.slice('components/ui/'.length);
    } else {
      relPath = path.basename(relPath);
    }
    const destPath = path.join(targetUiDir, relPath);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, file.content, 'utf-8');
    const relativeDest = path.relative(process.cwd(), destPath);
    console.log(`  ${GREEN}+${RESET} ${DIM}Created${RESET} ${BOLD}${relativeDest}${RESET}`);
  }

  // Copy public assets if bundled (e.g. particle engine and textures)
  if (registryItem.publicFiles && registryItem.publicFiles.length > 0) {
    for (const pubFile of registryItem.publicFiles) {
      const destPath = path.join(process.cwd(), pubFile.target);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      if (pubFile.encoding === 'base64') {
        fs.writeFileSync(destPath, Buffer.from(pubFile.content, 'base64'));
      } else {
        fs.writeFileSync(destPath, pubFile.content, 'utf-8');
      }
      const relativeDest = path.relative(process.cwd(), destPath);
      console.log(`  ${GREEN}+${RESET} ${DIM}Copied Engine Asset${RESET} ${BOLD}${relativeDest}${RESET}`);
    }
  }

  // Install dependencies if required
  if (registryItem.dependencies && registryItem.dependencies.length > 0) {
    const pm = detectPackageManager();
    const depsToInstall = registryItem.dependencies.join(' ');

    console.log(`\n${DIM}Installing dependencies (${depsToInstall}) via ${pm}...${RESET}`);
    try {
      const installCmd =
        pm === 'pnpm'
          ? `pnpm add ${depsToInstall}`
          : pm === 'yarn'
          ? `yarn add ${depsToInstall}`
          : pm === 'bun'
          ? `bun add ${depsToInstall}`
          : `npm install ${depsToInstall}`;

      execSync(installCmd, { stdio: 'inherit', cwd: process.cwd() });
      console.log(`${GREEN}✔${RESET} Dependencies installed successfully.`);
    } catch (e) {
      console.warn(`${YELLOW}!${RESET} Could not automatically install dependencies. Please run manually:`);
      console.log(`  ${BOLD}npm install ${depsToInstall}${RESET}`);
    }
  }

  console.log(`\n${GREEN}${BOLD}✔ Successfully integrated ${registryItem.title}!${RESET}`);
  console.log(`\nImport in your code:`);
  const mainTsxFile = registryItem.files.find((f) => f.path.endsWith('.tsx'));
  const componentExport = mainTsxFile ? path.basename(mainTsxFile.path, '.tsx') : 'Component';
  console.log(`  ${RED}import { ${componentExport} } from '@/components/ui/${componentExport}';${RESET}\n`);
}

async function handleList() {
  console.log(`${BOLD}Available Atronix Components:${RESET}\n`);
  try {
    const localIndex = path.join(process.cwd(), 'public', 'r', 'index.json');
    let items;
    if (fs.existsSync(localIndex)) {
      items = JSON.parse(fs.readFileSync(localIndex, 'utf-8'));
    } else {
      const indexUrl = `${GITHUB_RAW_BASE}/index.json`;
      items = await fetchJson(indexUrl);
    }

    if (items && items.length > 0) {
      items.forEach((item) => {
        console.log(`  ${RED}•${RESET} ${BOLD}${item.name.padEnd(18)}${RESET} ${DIM}${item.title} — ${item.description}${RESET}`);
      });
      console.log(`\nRun ${BOLD}npx atronix add <name>${RESET} to install any component.\n`);
    }
  } catch (err) {
    console.log(`Could not load registry index: ${err.message}`);
  }
}

async function main() {
  printBanner();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`Usage:`);
    console.log(`  ${BOLD}npx atronix add <component-name>${RESET}  Add a component to your project`);
    console.log(`  ${BOLD}npx atronix list${RESET}                  List all available components\n`);
    console.log(`Examples:`);
    console.log(`  ${DIM}npx atronix add orbit-globe${RESET}`);
    console.log(`  ${DIM}npx atronix add pendant-lamp${RESET}`);
    console.log(`  ${DIM}npx atronix add liquid-mitosis${RESET}\n`);
    process.exit(0);
  }

  if (command === 'list') {
    await handleList();
    process.exit(0);
  }

  if (command === 'add') {
    const componentId = args[1];
    await handleAdd(componentId);
    process.exit(0);
  }

  console.error(`${RED}Unknown command:${RESET} ${command}`);
  console.log(`Run ${BOLD}npx atronix --help${RESET} for available commands.\n`);
  process.exit(1);
}

main();
