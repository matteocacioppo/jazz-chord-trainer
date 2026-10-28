// Pubblica la build (dist/) sul ramo gh-pages, servito da GitHub Pages.
// Uso: npm run deploy
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const remote = execSync('git remote get-url origin').toString().trim();

run('npm test');
run('npm run build');
writeFileSync('dist/.nojekyll', ''); // niente elaborazione Jekyll da parte di GitHub

run('git init -q -b gh-pages', 'dist');
run('git add -A', 'dist');
run('git -c user.name=deploy -c user.email=deploy@localhost commit -q -m "Deploy"', 'dist');
run(`git push -f -q ${remote} gh-pages`, 'dist');
console.log('\nPubblicato. Il sito si aggiorna entro un paio di minuti.');
