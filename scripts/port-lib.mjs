import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('_legacy/src/js');

function transform(source, kind) {
  let s = source
    .replaceAll('import.meta.env.VITE_SUPABASE_URL', 'process.env.NEXT_PUBLIC_SUPABASE_URL')
    .replaceAll('import.meta.env.VITE_SUPABASE_ANON_KEY', 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
    .replaceAll('.js"', '"')
    .replaceAll(".js'", "'");

  if (kind === 'service') {
    s = s
      .replaceAll("from '../config/supabase'", "from '@/lib/supabase/client'")
      .replaceAll("from '../config/", "from '@/lib/config/")
      .replaceAll("from '../utils/", "from '@/lib/utils/")
      .replaceAll("from '../state/store'", "from '@/lib/state/store'")
      .replaceAll("from '../components/toast'", "from '@/components/toast'");
  }

  return s;
}

function copyDir(fromDir, toDir, kind) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    if (!name.endsWith('.js')) continue;
    if (kind === 'config' && name === 'supabase.js') continue;
    const source = fs.readFileSync(path.join(fromDir, name), 'utf8');
    const destName = name.replace(/\.js$/, '.ts');
    fs.writeFileSync(path.join(toDir, destName), transform(source, kind));
  }
}

copyDir(path.join(root, 'config'), path.join('src/lib/config'), 'config');
copyDir(path.join(root, 'utils'), path.join('src/lib/utils'), 'utils');
copyDir(path.join(root, 'services'), path.join('src/lib/services'), 'service');

console.log('ported lib files');
