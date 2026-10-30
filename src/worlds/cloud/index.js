import { LEVELS, play } from './engine.js';

export default {
  id: 'cloud',
  name: 'Reino de la Nube',
  tagline: 'AWS CLI: S3, IAM, EC2 y costos',
  color: '#41a6f6',
  fileLabel: 'terminal',
  idleOutput: 'La salida de la terminal aparecerá aquí. Todo es simulado: nada llega a AWS.',
  levels: LEVELS,
  partSizes: [4, 3, 3],
  map: { theme: 'cloud', station: 'cloud', sign: 'CLOUD QUEST', trail: 'sigue el cable' },
  async run(level, src) {
    const r = play(level, src);
    if (r.pass) return { pass: true, out: r.out, error: null };
    return { pass: false, out: r.out, error: r.cli ? r.msg : `✘ ${r.msg}` };
  },
  victory: `
    <p>Ya conoces lo básico: CLI e identidad, regiones, S3, IAM y mínimo privilegio, security groups, EC2 y control de costos. 🎉</p>
    <p><b>Siguiente paso:</b> los mismos comandos, pero de verdad:</p>
    <pre>1. Sin riesgo: un emulador local de AWS en localhost:4566
2. Con cuidado: tu cuenta real con un perfil propio
   (revisa costos y borra todo al terminar)</pre>`,
};
