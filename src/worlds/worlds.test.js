import { describe, it, expect } from 'vitest';
import { WORLDS, partsOf } from './index.js';
import { runJava, workerSource } from './java/index.js';
import { execute } from './java/engine.js';
import cloud from './cloud/index.js';

const java = WORLDS.find(w => w.id === 'java');
const runLocal = (level, src) => runJava(level, src, async code => execute(code));

describe('world registry', () => {
  it('registers Java and Cloud', () => {
    expect(WORLDS.map(w => w.id)).toEqual(['java', 'cloud']);
  });

  it('gives Java three worlds of 10 levels, each split 4/3/3', () => {
    expect(java.levels).toHaveLength(30);
    expect(java.chapters.map(c => c.name)).toEqual(['Fundamentos', 'Herramientas', 'Objetos']);
    expect(partsOf(java).map(p => p.label)).toEqual(['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3']);
    expect(partsOf(java).map(p => p.end)).toEqual([4, 7, 10, 14, 17, 20, 24, 27, 30]);
  });

  it('keeps Cloud as one world labelled 1-1..1-3', () => {
    expect(cloud.levels).toHaveLength(10);
    expect(partsOf(cloud).map(p => p.label)).toEqual(['1-1', '1-2', '1-3']);
  });

  it('keeps the original Java Quest levels first and in order', () => {
    expect(java.levels[0].name).toBe('La Señal');
    expect(java.levels[9].name).toBe('JEFE FINAL: El Dragón Par');
  });
});

describe('Java kingdom', () => {
  it('passes every solution and fails every starter', async () => {
    for (const lv of java.levels) {
      expect((await runLocal(lv, lv.solution)).pass, lv.name).toBe(true);
      expect((await runLocal(lv, lv.starter)).pass, lv.name).toBe(false);
    }
  });

  it('builds a worker script that still works when the bundler renames execute', () => {
    // Simulates minification: same body, different function name.
    const renamed = new Function(`return ${execute.toString().replace(/^function execute/, 'function x0')}`)();
    let reply;
    const scope = { postMessage: r => { reply = r; } };
    new Function('postMessage', `${workerSource(renamed)}\nthis.onmessage = onmessage;`).call(scope, scope.postMessage);
    scope.onmessage({ data: '__println("hi");' });
    expect(reply).toEqual({ ok: true, out: ['hi'] });
  });

  it('reports simulated compile errors with the file and line', async () => {
    const r = await runLocal(java.levels[0], 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("x")\n    }\n}\n');
    expect(r.pass).toBe(false);
    expect(r.error).toMatch(/^Main\.java:3: error: ';' expected/);
  });

  it('shows program output and the expected output on mismatch', async () => {
    const src = java.levels[0].solution.replace('Hola, Mundo!', 'Adios');
    const r = await runLocal(java.levels[0], src);
    expect(r.out).toEqual(['Adios']);
    expect(r.error).toMatch(/Se esperaba:\nHola, Mundo!/);
  });
});

describe('Cloud kingdom', () => {
  const lv = i => cloud.levels[i];
  const fails = async (i, src, re) => {
    const r = await cloud.run(lv(i), src);
    expect(r.pass, src).toBe(false);
    expect(r.error).toMatch(re);
  };

  it('passes every solution and fails every starter', async () => {
    for (const l of cloud.levels) {
      expect((await cloud.run(l, l.solution)).pass, l.name).toBe(true);
      expect((await cloud.run(l, l.starter)).pass, l.name).toBe(false);
    }
  });

  it('keeps the original Cloud Quest failure messages', async () => {
    await fails(2, 'aws s3 mb s3://Cofre-Leo', /InvalidBucketName/);
    await fails(1, 'aws configure set region eu-west-1\naws configure get region', /us-east-2/);
    await fails(5, 'aws iam attach-user-policy --user-name aprendiz --policy-arn arn:aws:iam::aws:policy/AdministratorAccess', /mínimo privilegio/);
    await fails(7, 'aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type m5.4xlarge --security-groups web-sg', /t3\.micro/);
    await fails(0, 'aws s4 ls', /Invalid choice/);
    await fails(0, 's3 ls', /command not found/);
  });

  it('accepts line continuation and global flags', async () => {
    expect((await cloud.run(lv(4), 'aws iam create-user \\\n  --user-name aprendiz --profile leo-glez')).pass).toBe(true);
  });
});
