import concurrently from 'concurrently';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fecLogger, LogType } from '@redhat-cloud-services/frontend-components-config-utilities';
import { FrontendCRD } from '@redhat-cloud-services/frontend-components-config-utilities/feo/feo-types';
import { hasFEOFeaturesEnabled, readFrontendCRD } from '@redhat-cloud-services/frontend-components-config-utilities/feo/crd-check';
import { validateFECConfig } from './common';
import { execSync } from 'child_process';

const DEFAULT_LOCAL_ROUTE = 'host.docker.internal';
const DEFAULT_CHROME_SERVER_PORT = 9998;
const CONTAINER_PORT = 1337;
const CONTAINER_NAME = 'consoledot-testing-proxy';
const IMAGE_REPO_DEV_PROXY = `quay.io/dvagner/${CONTAINER_NAME}`;
const LATEST_IMAGE_TAG = 'latest';
const PROXY_URL = 'http://squid.corp.redhat.com:3128';

type ContainerRuntime = 'docker' | 'podman';
let execBin: ContainerRuntime | undefined = undefined;

interface RouteConfig {
  url: string;
  isChrome?: boolean;
}

function checkContainerRuntime(): ContainerRuntime {
  try {
    if (execSync('which podman').toString().trim().length > 0) {
      return 'podman';
    }
  } catch (_) {
    // Ignore!
  }

  try {
    if (execSync('which docker').toString().trim().length > 0) {
      return 'docker';
    }
  } catch (_) {
    // Ignore!
  }

  throw new Error('No container runtime found');
}

function cleanupContainer() {
  try {
    fecLogger(LogType.debug, `Stop existing ${CONTAINER_NAME}`);
    execSync(`${execBin} stop ${CONTAINER_NAME}`, {
      stdio: 'inherit',
    });
    fecLogger(LogType.debug, `Remove existing ${CONTAINER_NAME}`);
    execSync(`${execBin} rm ${CONTAINER_NAME}`, {
      stdio: 'inherit',
    });
  } catch (error) {
    fecLogger(LogType.info, 'No existing chrome container found');
  }
}

function pullImage(repo: string, tag: string) {
  execSync(`${execBin} pull ${repo}:${tag}`, {
    stdio: 'inherit',
  });
}

function getCdnPath(fecConfig: any, webpackConfig: any, cwd: string): string {
  let cdnPath: string;
  const { insights } = require(`${cwd}/package.json`);
  const frontendCRDPath = fecConfig.frontendCRDPath ?? `${cwd}/deploy/frontend.yaml`;
  const frontendCRDRef: { current?: FrontendCRD } = { current: undefined };
  let FEOFeaturesEnabled = false;

  try {
    frontendCRDRef.current = readFrontendCRD(frontendCRDPath);
    FEOFeaturesEnabled = hasFEOFeaturesEnabled(frontendCRDRef.current);
  } catch (e) {
    fecLogger(
      LogType.warn,
      `FEO features are not enabled. Unable to find frontend CRD file at ${frontendCRDPath}. If you want FEO features for local development, make sure to have a "deploy/frontend.yaml" file in your project or specify its location via "frontendCRDPath" attribute.`,
    );
  }

  if (FEOFeaturesEnabled && fecConfig.publicPath === 'auto' && frontendCRDRef.current) {
    cdnPath = `${frontendCRDRef.current?.objects[0]?.spec.frontend.paths[0]}/`.replace(/\/\//, '/');
  } else if (fecConfig.publicPath === 'auto') {
    cdnPath = `/${fecConfig.deployment || 'apps'}/${insights.appname}/`;
  } else {
    cdnPath = webpackConfig.output.publicPath;
  }

  return cdnPath ?? '';
}

function createRoutesConfig(cdnPath: string, port: string, localChrome: any, fecConfig: any, filename: string = 'routes.json'): string {
  let routes: Map<string, RouteConfig> = new Map();

  if (!!localChrome) {
    routes.set('/apps/chrome/*', {
      url: `http://${process.env.FEC_CHROME_HOST}:${process.env.FEC_CHROME_PORT}`,
      isChrome: true,
    });
  }

  routes.set(`${cdnPath}*`, { url: `${DEFAULT_LOCAL_ROUTE}:${port}` });

  let fecRoutes = fecConfig?.routes || undefined;
  if (fecConfig?.routesPath) {
    fecRoutes = require(fecConfig.routesPath);
  }
  if (fecRoutes) {
    fecRoutes = fecRoutes?.routes || fecRoutes;
  }

  Object.entries<any>(fecRoutes || {}).forEach(([handle, config]) => {
    if (config?.host) {
      const host = config.host.replace(/localhost/, DEFAULT_LOCAL_ROUTE).replace(/127\.0\.0\.1/, DEFAULT_LOCAL_ROUTE);
      routes.set(`${handle}*`, { url: host });
    }
  });

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);
  const jsonContent = JSON.stringify(Object.fromEntries(routes));
  console.log('ROUTES CONFIG: ', jsonContent); // TODO: REMOVE
  fs.writeFileSync(tempFilePath, jsonContent, { flag: 'w' });

  return tempFilePath;
}

function configureEnvVars(fecConfig: any, argv: any, localChrome: any) {
  const clouddotEnvOptions = ['stage', 'prod', 'dev'];
  if (argv?.clouddotEnv && !clouddotEnvOptions.includes(argv?.clouddotEnv)) {
    throw Error(`Incorrect argument value:\n--clouddotEnv must be one of: [${clouddotEnvOptions.toString()}]\nRun fec --help for more information.`);
  }
  process.env.HCC_ENV = argv?.clouddotEnv ?? 'stage';
  const hccEnvSuffix = process.env.HCC_ENV === 'prod' ? '' : `${process.env.HCC_ENV}.`;
  process.env.HCC_ENV_URL = `https://console.${hccEnvSuffix}redhat.com`;

  let chromeHost = fecConfig.chromeHost;
  if (!chromeHost && localChrome) {
    chromeHost = DEFAULT_LOCAL_ROUTE;
  }
  process.env.FEC_CHROME_HOST = chromeHost ?? '';
  process.env.FEC_CHROME_PORT = fecConfig.chromePort ?? DEFAULT_CHROME_SERVER_PORT;
}

async function devProxyScript(
  argv: {
    chromeServerPort?: number | string;
    clouddotEnv?: string;
    config?: any;
    port?: string;
  },
  cwd: string,
) {
  let localChrome = false;
  let fecConfig: any = {};
  let webpackConfig;
  const webpackConfigPath: string = argv.config || `${cwd}/node_modules/@redhat-cloud-services/frontend-components-config/bin/prod.webpack.config.js`;

  // Get Configs
  try {
    validateFECConfig(cwd);
    fecConfig = require(process.env.FEC_CONFIG_PATH!);
  } catch (error) {
    console.error('Failed to get the FEC config, error:', error);
    process.exit(1);
  }

  try {
    fs.statSync(webpackConfigPath);
    webpackConfig = require(webpackConfigPath);
    if (typeof webpackConfig === 'function') {
      webpackConfig = webpackConfig(process.env);
    }
  } catch (error) {
    console.log('Failed to get the Webpack config, error:', error);
    process.exit(1);
  }

  // Process environments and localChrome
  try {
    localChrome = fecConfig?.localChrome;
    configureEnvVars(fecConfig, argv, localChrome);
  } catch (error) {
    console.error('Failed to setup environment from args and config, error:', error);
    process.exit(1);
  }

  // Setup Routes
  let cdnPath: string;
  let routesConfigPath: string;
  const staticPort = '8003';
  try {
    cdnPath = getCdnPath(fecConfig, webpackConfig, cwd);
    routesConfigPath = createRoutesConfig(cdnPath, staticPort, localChrome, fecConfig);
  } catch (error) {
    console.error('Failed to generate the proxy routes config, error:', error);
    process.exit(1);
  }

  // Setup Container
  execBin = checkContainerRuntime();
  pullImage(IMAGE_REPO_DEV_PROXY, LATEST_IMAGE_TAG);
  cleanupContainer();

  // Exec
  try {
    await Promise.resolve(webpackConfig).then((config) => {
      const outputPath = config.output.path;
      const proxyEnvVar = process.env.HCC_ENV === 'stage' ? `-e HTTPS_PROXY=${PROXY_URL}` : '';

      concurrently([
        `npm exec -- webpack --config ${webpackConfigPath} --watch --output-path ${path.join(outputPath, cdnPath)}`,
        `npm exec -- http-server ${outputPath} -p ${staticPort} -c-1 -a :: --cors=*`,
        `${execBin} run -d -e HCC_ENV=${process.env.HCC_ENV} -e HCC_ENV_URL=${process.env.HCC_ENV_URL} ${proxyEnvVar} -p ${argv.port || 1337}:${CONTAINER_PORT} -v "${routesConfigPath}:/config/routes.json:ro,Z" --name ${CONTAINER_NAME} ${IMAGE_REPO_DEV_PROXY}:${LATEST_IMAGE_TAG}`,
      ]);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    cleanupContainer();
  }
}

module.exports = devProxyScript;
