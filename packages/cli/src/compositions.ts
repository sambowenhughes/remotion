import {getCompositions, RenderInternals} from '@remotion/renderer';
import {registerCleanupJob} from './cleanup-before-quit';
import {ConfigInternals} from './config';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {printCompositions} from './print-compositions';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';

export const listCompositionsCommand = async (
	remotionRoot: string,
	args: string[]
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot);

	if (!file) {
		Log.error(
			'The `compositions` command requires you to specify a entry point. For example'
		);
		Log.error('  npx remotion compositions src/index.ts');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	Log.verbose('Entry point:', file, 'reason:', reason);

	const downloadMap = RenderInternals.makeDownloadMap();
	registerCleanupJob(() => RenderInternals.cleanDownloadMap(downloadMap));

	await loadConfig(remotionRoot);

	const {
		browserExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		puppeteerTimeout,
		port,
		publicDir,
	} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		remotionRoot,
	});

	const {urlOrBundle: bundled, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			remotionRoot,
			fullPath: file,
			publicDir,
			onProgress: () => undefined,
			indentOutput: false,
			logLevel: ConfigInternals.Logging.getLogLevel(),
			bundlingStep: 0,
			steps: 1,
			onDirectoryCreated: (dir) => {
				registerCleanupJob(() => RenderInternals.deleteDirectory(dir));
			},
			quietProgress: false,
		});

	registerCleanupJob(() => cleanupBundle());

	const compositions = await getCompositions(bundled, {
		browserExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		timeoutInMilliseconds: puppeteerTimeout,
		port,
		downloadMap,
	});

	printCompositions(compositions);

	Log.verbose('Cleaned up', downloadMap.assetDir);
};
