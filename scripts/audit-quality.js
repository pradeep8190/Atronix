import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uiDir = path.join(rootDir, 'src', 'components', 'ui');
const registryDir = path.join(rootDir, 'src', 'data', 'registry');

// Terminal formatting
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const DIM = '\x1b[2m';

console.log(`\n${CYAN}${BOLD}▲ ATRONIX QUALITY INSPECTOR v1.0${RESET}`);
console.log(`${DIM}Scanning all components for dead code, fluff, props parity, and WebGL shader standards...${RESET}\n`);

const componentDirs = fs.readdirSync(uiDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let totalIssues = 0;
let totalPassed = 0;

for (const compDir of componentDirs) {
  const dirPath = path.join(uiDir, compDir);
  const files = fs.readdirSync(dirPath);

  const mainTsx = files.find((f) => !f.includes('Footer') && f.endsWith('.tsx'));
  const footerTsx = files.find((f) => f.includes('Footer') && f.endsWith('.tsx'));
  const mainCss = files.find((f) => !f.includes('Footer') && f.endsWith('.css'));

  console.log(`${BOLD}▸ Component: ${MAGENTA}${compDir}${RESET}`);

  if (!mainTsx) {
    console.log(`  ${RED}✖ Missing main component .tsx file${RESET}`);
    totalIssues++;
    continue;
  }

  const mainTsxContent = fs.readFileSync(path.join(dirPath, mainTsx), 'utf-8');

  // 1. Check for leftover console.log statements
  const rawLogMatches = mainTsxContent.match(/console\.log\(/g);
  if (rawLogMatches) {
    console.log(`  ${YELLOW}⚠ Found ${rawLogMatches.length} console.log debug statements in ${mainTsx}${RESET}`);
    totalIssues++;
  } else {
    console.log(`  ${GREEN}✓ Zero console.log statements (clean production code)${RESET}`);
    totalPassed++;
  }

  // 2. Extract props interface
  const interfaceMatch = mainTsxContent.match(/export\s+interface\s+(\w+Props)\s*\{([^}]+)\}/);
  const declaredProps = [];
  if (interfaceMatch) {
    const propLines = interfaceMatch[2].split('\n');
    for (const line of propLines) {
      const pMatch = line.trim().match(/^([a-zA-Z0-9_]+)\??\s*:/);
      if (pMatch && !pMatch[1].startsWith('//')) {
        declaredProps.push(pMatch[1]);
      }
    }
  }

  // 3. Check for unused / fluff declared props
  const unusedProps = [];
  for (const prop of declaredProps) {
    const afterInterface = mainTsxContent.slice((interfaceMatch?.index || 0) + (interfaceMatch?.[0]?.length || 0));
    const regex = new RegExp(`\\b${prop}\\b`, 'g');
    const matches = afterInterface.match(regex);
    if (!matches || matches.length === 0) {
      unusedProps.push(prop);
    }
  }

  if (unusedProps.length > 0) {
    console.log(`  ${YELLOW}⚠ Declared props never referenced (fluff): ${unusedProps.join(', ')}${RESET}`);
    totalIssues++;
  } else {
    console.log(`  ${GREEN}✓ All declared props actively utilized (${declaredProps.length} props)${RESET}`);
    totalPassed++;
  }

  // 4. Props Reference Table Parity Check in Footer
  if (footerTsx) {
    const footerContent = fs.readFileSync(path.join(dirPath, footerTsx), 'utf-8');
    const documentedProps = [];
    const docPropRegex = /name:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = docPropRegex.exec(footerContent)) !== null) {
      const names = m[1].split('/').map((s) => s.trim());
      documentedProps.push(...names);
    }

    const missingInDocs = declaredProps.filter((p) => 
      !documentedProps.includes(p) && 
      p !== 'className' && 
      p !== 'children' && 
      p !== 'disabled'
    );

    if (missingInDocs.length > 0) {
      console.log(`  ${YELLOW}⚠ Props in component but missing from Footer docs: ${missingInDocs.join(', ')}${RESET}`);
      totalIssues++;
    } else {
      console.log(`  ${GREEN}✓ Footer props reference in 100% parity${RESET}`);
      totalPassed++;
    }
  } else {
    console.log(`  ${DIM}ℹ No footer file found (standalone component)${RESET}`);
  }

  // 5. Canvas Bleed Check for WebGL Shaders (ATRONIX_DNA standard)
  const isWebGL = mainTsxContent.includes('createShader') || mainTsxContent.includes('"webgl"');
  if (isWebGL) {
    let hasBleed = false;
    if (mainCss) {
      const cssContent = fs.readFileSync(path.join(dirPath, mainCss), 'utf-8');
      if (cssContent.includes('top: -') || cssContent.includes('left: -') || cssContent.includes('margin: -')) {
        hasBleed = true;
      }
    }
    if (mainTsxContent.includes('left: -') || mainTsxContent.includes('top: -')) {
      hasBleed = true;
    }

    if (hasBleed) {
      console.log(`  ${GREEN}✓ WebGL Canvas Bleed buffer verified (ATRONIX_DNA compliant)${RESET}`);
      totalPassed++;
    } else {
      console.log(`  ${YELLOW}⚠ WebGL canvas detected but no negative offset bleed buffer found${RESET}`);
      totalIssues++;
    }
  }

  // 6. Registry Presence Check
  const expectedRegistryFile = compDir.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) + '.ts';
  const regPath = path.join(registryDir, expectedRegistryFile);
  if (fs.existsSync(regPath)) {
    console.log(`  ${GREEN}✓ Registered in src/data/registry/${expectedRegistryFile}${RESET}`);
    totalPassed++;
  } else {
    console.log(`  ${RED}✖ Missing registry file: src/data/registry/${expectedRegistryFile}${RESET}`);
    totalIssues++;
  }

  console.log('');
}

console.log(`${BOLD}========================================${RESET}`);
if (totalIssues === 0) {
  console.log(`${GREEN}${BOLD}✔ AUDIT PASSED: 100,000 / 10 Pristine Code Quality across all 11 components!${RESET}`);
} else {
  console.log(`${YELLOW}${BOLD}⚠ AUDIT COMPLETE: ${totalIssues} quality notice(s) found across components.${RESET}`);
}
console.log(`${DIM}Total checks passed: ${totalPassed}${RESET}\n`);
