import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { TAGS } from './setup-swagger';

/** Lista recursivamente os arquivos `*.controller.ts` sob um diretório. */
function findControllers(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findControllers(full);
    return entry.name.endsWith('.controller.ts') ? [full] : [];
  });
}

/** Extrai os nomes de tag declarados em `@ApiTags(...)` em todos os controllers. */
function collectUsedTags(): Set<string> {
  const apiTagsRe = /@ApiTags\(([^)]*)\)/g;
  const stringRe = /['"]([^'"]+)['"]/g;
  const tags = new Set<string>();

  for (const file of findControllers(join(process.cwd(), 'src'))) {
    const content = readFileSync(file, 'utf8');
    let call: RegExpExecArray | null;
    while ((call = apiTagsRe.exec(content)) !== null) {
      let str: RegExpExecArray | null;
      while ((str = stringRe.exec(call[1])) !== null) {
        tags.add(str[1]);
      }
    }
  }
  return tags;
}

describe('setup-swagger TAGS', () => {
  it('registra em TAGS toda tag usada em @ApiTags nos controllers', () => {
    const registered = new Set(TAGS.map(([name]) => name));
    const missing = [...collectUsedTags()]
      .filter((tag) => !registered.has(tag))
      .sort();
    expect(missing).toEqual([]);
  });

  it('não tem nomes de tag duplicados', () => {
    const names = TAGS.map(([name]) => name);
    expect(new Set(names).size).toBe(names.length);
  });
});
