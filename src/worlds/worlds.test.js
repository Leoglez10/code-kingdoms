import { describe, it, expect } from 'vitest';
import { WORLDS, partsOf } from './index.js';
import { runJava } from './java/index.js';
import { execute } from './java/engine.js';
import cloud from './cloud/index.js';

const java = WORLDS.find(w => w.id === 'java');
const runLocal = (level, src) => runJava(level, src, async code => execute(code));

describe('world registry', () => {
  it('registers Java and Cloud with 10 levels split 4/3/3', () => {
    expect(WORLDS.map(w => w.id)).toEqual(['java', 'cloud']);
    for (const w of WORLDS) {
      expect(w.levels).toHaveLength(10);
      expect(partsOf(w).map(p => [p.start, p.end])).toEqual([[0, 4], [4, 7], [7, 10]]);
    }
  });

  it('labels parts by kingdom number like 1-1, 2-3', () => {
    expect(partsOf(WORLDS[0]).map(p => p.label)).toEqual(['1-1', '1-2', '1-3']);
    expect(partsOf(WORLDS[1])[2].label).toBe('2-3');
  });
});

describe('Java kingdom', () => {
  it('passes every solution and fails every starter', async () => {
    for (const lv of java.levels) {
      expect((await runLocal(lv, lv.solution)).pass, lv.name).toBe(true);
      expect((await runLocal(lv, lv.starter)).pass, lv.name).toBe(false);
    }
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
