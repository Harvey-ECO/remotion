// Renderiza todos os Reels de src/posts.ts em out/<id>.mp4 e a capa em out/<id>-capa.png.
import {execSync} from 'node:child_process';

const saida = execSync('npx remotion compositions --quiet', {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
const ids = saida.trim().split(/\s+/).filter((id) => /^[a-z0-9-]+$/.test(id));
for (const id of ids) {
	execSync(`npx remotion render ${id} out/${id}.mp4 --crf=18`, {stdio: 'inherit'});
	execSync(`npx remotion still ${id} out/${id}-capa.png --frame=75`, {stdio: 'inherit'});
}
