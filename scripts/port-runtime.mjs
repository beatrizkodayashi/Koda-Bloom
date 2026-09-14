import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('_legacy/src/js');

function transform(source, kind) {
  let s = source
    .replaceAll('.js"', '"')
    .replaceAll(".js'", "'")
    .replaceAll('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
    .replaceAll('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  s = s
    .replaceAll("from '../config/supabase'", "from '@/lib/supabase/client'")
    .replaceAll("from '../config/", "from '@/lib/config/")
    .replaceAll("from '../router'", "from '@/lib/navigation'")
    .replaceAll("from '../state/store'", "from '@/lib/state/store'")
    .replaceAll("from '../services/", "from '@/lib/services/")
    .replaceAll("from '../utils/", "from '@/lib/utils/")
    .replaceAll("from '../components/", "from '@/legacy-runtime/components/");

  if (kind === 'component') {
    s = s.replace(/from '\.\//g, "from '@/legacy-runtime/components/");
  }

  if (!s.startsWith('// @ts-nocheck')) {
    s = `// @ts-nocheck\n${s}`;
  }
  return s;
}

function copyDir(fromDir, toDir, kind) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    if (!name.endsWith('.js')) continue;
    const source = fs.readFileSync(path.join(fromDir, name), 'utf8');
    fs.writeFileSync(path.join(toDir, name.replace(/\.js$/, '.ts')), transform(source, kind));
  }
}

copyDir(path.join(root, 'components'), path.join('src/legacy-runtime/components'), 'component');
copyDir(path.join(root, 'pages'), path.join('src/legacy-runtime/pages'), 'page');
console.log('ported legacy runtime');
