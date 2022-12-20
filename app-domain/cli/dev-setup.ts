import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { prompt } from 'prompts';
import { TargetEnvironments } from '../app-components/app-config-manager';
import 'colors';

type EnvFileType = {
  PG_HOST: string;
  PG_PORT: string;
  PG_DATABASE: string;
  PG_USER: string;
  PG_PSWD: string;
  SB_REST_ENDPOINT: string;
  SB_SERVICE_SECRET: string;
};

type EnvFileStatType = {
  name: string;
  fullPath: string;
  isPresent: boolean;
};

const detectEnvFiles = () => {
  const basePath = process.cwd();

  const envFilesMap = new Map<string, EnvFileStatType>();
  for (const prefix of Object.values(TargetEnvironments)) {
    const fullPath = path.normalize(`${basePath}${path.sep}${prefix}.env`);
    envFilesMap.set(prefix, {
      name: path.basename(fullPath),
      fullPath,
      isPresent: fs.existsSync(fullPath),
    });
  }

  return envFilesMap;
};

(async () => {
  console.log('==[ Setup of .env file ]=='.blue);

  console.log('Detecting current .env files...');
  const envFilesMap = detectEnvFiles();

  for (const [key, fileStats] of envFilesMap.entries()) {
    const status = fileStats.isPresent ? 'exists'.green : 'not defined'.gray;
    const line = `- ${key}: ${status}`;
    console.log(line);
  }

  console.log('');

  const response = await prompt({
    type: 'select',
    name: 'environment',
    message: 'Select an environment to create/update:',
    initial: 0,
    choices: [
      {
        title: 'dev',
        value: 'dev',
        description: 'development environment against a development supabase instance',
      },
      {
        title: 'dev-local',
        value: 'dev-local',
        description: 'development environment, against a local postgres database',
      },
      {
        title: 'prod',
        value: 'prod',
        description: 'production environment. For ADMIN and DEVOP operations only.',
      },
    ],
  });

  if (!response.hasOwnProperty('environment')) {
    console.log('\n.env file creation aborted!\n'.red);
    process.exit(1);
  }

  const selectedFileStat = envFilesMap.get(response.environment);
  if (!selectedFileStat) {
    console.log(`\nSelected option ${response.environemnt} is invalid.\n`);
    process.exit(1);
  }

  console.log(`\nSetting up ${selectedFileStat.name.blue}:`);
  let envConfig: EnvFileType | null = null;
  if (selectedFileStat.isPresent) {
    const fileContent = fs.readFileSync(selectedFileStat.fullPath);
    envConfig = dotenv.parse(fileContent) as EnvFileType;
  }

  const userConfig = await prompt([
    {
      type: 'text',
      name: 'PG_HOST',
      message: `Postgres HOST:`,
      initial: envConfig?.PG_HOST || '',
    },
    {
      type: 'text',
      name: 'PG_PORT',
      message: `Postgres PORT:`,
      initial: envConfig?.PG_PORT || '',
    },
    {
      type: 'text',
      name: 'PG_DATABASE',
      message: `Postgres DATABASE:`,
      initial: envConfig?.PG_DATABASE || '',
    },
    {
      type: 'text',
      name: 'PG_USER',
      message: `Postgres USER:`,
      initial: envConfig?.PG_USER || '',
    },
    {
      type: 'text',
      name: 'PG_PSWD',
      message: `Postgres PASSWORD:`,
      initial: envConfig?.PG_PSWD || '',
    },
    {
      type: 'text',
      name: 'SB_REST_ENDPOINT',
      message: `Supabase REST ENDPOINT:`,
      initial: envConfig?.SB_REST_ENDPOINT || '',
    },
    {
      type: 'text',
      name: 'SB_SERVICE_SECRET',
      message: `Supabase SERVICE SECRET:`,
      initial: envConfig?.SB_SERVICE_SECRET || '',
    },
  ]);

  console.log(`\nSaving configuration to ${selectedFileStat.name}...`);
  const envFileContent = Object.entries(userConfig)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  try {
    fs.writeFileSync(selectedFileStat.fullPath, envFileContent);
  } catch (e: any) {
    console.log(`An error occurred while saving .env file...`.red);
    console.log(e.message.red);
    process.exit(1);
  }

  console.log(`- ${selectedFileStat.name} updated successfully!\n`.blue);
})();
