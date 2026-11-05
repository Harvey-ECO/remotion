import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');

// Em ambientes sem acesso ao download automático do Chrome, informe um navegador local:
// REMOTION_CHROME=/caminho/do/chrome-headless-shell npx remotion render ...
if (process.env.REMOTION_CHROME) {
	Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
