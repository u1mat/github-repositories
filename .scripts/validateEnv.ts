import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const ENV_FILE = 'src/shared/libs/env';
const SOURCE_FILE = `${ENV_FILE}.ts`;
const COMPILED_FILE = `${ENV_FILE}--compiled.mjs`;
const TEMP_JS_FILE = `${ENV_FILE}.js`;

try {
  const envPath = join(rootDir, '.env');
  const envLocalPath = join(rootDir, '.env.local');

  if (existsSync(envPath)) {
    config({ path: envPath });
    console.log('✓ Loaded .env');
  }
  if (existsSync(envLocalPath)) {
    config({ path: envLocalPath });
    console.log('✓ Loaded .env.local');
  }

  console.log('\n📦 Compiling env.ts...');
  execSync(
    `npx tsc ${SOURCE_FILE} --skipLibCheck --module esnext --moduleResolution node --types "vite/client"`,
    { stdio: 'inherit', cwd: rootDir }
  );

  const tempJsPath = join(rootDir, TEMP_JS_FILE);
  const compiledPath = join(rootDir, COMPILED_FILE);

  if (existsSync(tempJsPath)) {
    console.log('🔄 Processing compiled file...');
    let content = readFileSync(tempJsPath, 'utf8');
    content = content.replace(/import\.meta\.env/g, 'process.env');
    writeFileSync(compiledPath, content);
    unlinkSync(tempJsPath);
  }

  console.log('✅ Validating environment variables...');
  await import(`file:///${compiledPath.replace(/\\/g, '/')}`);

  if (existsSync(compiledPath)) {
    unlinkSync(compiledPath);
  }

  console.log('\n✅ Environment variables validated successfully!\n');
} catch (error) {
  const compiledPath = join(rootDir, COMPILED_FILE);
  const tempJsPath = join(rootDir, TEMP_JS_FILE);

  try {
    if (existsSync(tempJsPath)) unlinkSync(tempJsPath);
    if (existsSync(compiledPath)) unlinkSync(compiledPath);
  } catch {
    /* empty */
  }

  console.error('\n❌ Environment validation failed!\n');
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}
