// Ported from Cloud Quest. Simulated AWS CLI, levels and checker.
// ponytail: simulated AWS CLI for the subset taught here; responses are trimmed versions of the real ones.
const ACCOUNT = '123456789012';
const NOW = '2026-10-25 12:00:00';
const AMI = 'ami-0c55b159cbfafe1f0';
const CHEAP_TYPES = ['t2.micro', 't3.micro', 't4g.micro'];
const MANAGED_POLICIES = ['AdministratorAccess', 'AmazonS3ReadOnlyAccess', 'AmazonS3FullAccess', 'AmazonEC2ReadOnlyAccess'];
const READ_ONLY = 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess';
const LOCAL_FILES = {
  'mapa.txt': 'El tesoro está bajo el gran roble.\n',
  'index.html': '<h1>Mi castillo en la nube</h1>\n',
  'error.html': '<h1>404: aquí no hay nada</h1>\n',
};
const STATE_CODES = { pending: 0, running: 16, 'shutting-down': 32, terminated: 48, stopping: 64, stopped: 80 };

class CliError extends Error {}
const fail = (msg, hint) => { throw new CliError(hint ? `${msg}\n→ ${hint}` : msg); };
const json = o => JSON.stringify(o, null, 4);
const dict = () => Object.create(null);
const st = name => ({ Code: STATE_CODES[name], Name: name });

function newWorld() {
  return { region: 'us-east-2', buckets: dict(), users: dict(), sgs: dict(), instances: dict(), seq: dict() };
}
function nextId(w, prefix) {
  w.seq[prefix] = (w.seq[prefix] || 0) + 1;
  return prefix + String(w.seq[prefix]).padStart(4, '0');
}
const addBucket = (w, name) => { w.buckets[name] = { objects: dict(), website: null }; };
const addSg = (w, name, rules = []) => { w.sgs[name] = { id: nextId(w, 'sg-0a1b2c3d4e5f6'), rules }; };
function launch(w, type, image, groups) {
  const id = nextId(w, 'i-0a1b2c3d4e5f6');
  w.instances[id] = { type, image, groups, state: 'running' };
  return id;
}

// Splits a command line like a shell would: spaces separate, quotes group.
function tokenize(line) {
  const out = [];
  let cur = '', quote = null, has = false;
  for (const c of line) {
    if (quote) { if (c === quote) quote = null; else cur += c; continue; }
    if (c === '"' || c === "'") { quote = c; has = true; continue; }
    if (/\s/.test(c)) { if (cur || has) out.push(cur); cur = ''; has = false; continue; }
    cur += c;
  }
  if (quote) fail('Error: comillas sin cerrar.', `Cierra la ${quote === '"' ? 'comilla doble' : 'comilla simple'} que abriste.`);
  if (cur || has) out.push(cur);
  return out;
}

// --flag takes every following token until the next --flag (so --instance-ids accepts several ids).
function parseArgs(tokens) {
  const pos = [], opt = dict();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.startsWith('--')) { pos.push(t); continue; }
    const vals = [];
    while (i + 1 < tokens.length && !tokens[i + 1].startsWith('--')) vals.push(tokens[++i]);
    opt[t.slice(2)] = vals;
  }
  return { pos, opt };
}

function need(a, name) {
  const v = a.opt[name]?.[0];
  if (v === undefined || v === '') fail(`aws: error: the following arguments are required: --${name}`);
  return v;
}

function s3Uri(s) {
  const m = /^s3:\/\/([^/]+)\/?(.*)$/.exec(s || '');
  if (!m) fail(`Error: Invalid argument type: ${s ?? '(vacío)'}`, 'Las rutas de S3 se escriben así: s3://nombre-del-bucket/archivo');
  return { bucket: m[1], key: m[2] };
}

function ec2Region(w, a) {
  if (!(a.opt.region?.[0] ?? w.region)) fail('You must specify a region. You can also configure your region by running "aws configure".');
}

function findSg(w, a, op) {
  const name = a.opt['group-name']?.[0], id = a.opt['group-id']?.[0];
  if (!name && !id) fail('aws: error: one of the arguments --group-name --group-id is required');
  const sg = name ? w.sgs[name] : Object.values(w.sgs).find(g => g.id === id);
  if (!sg) fail(`An error occurred (InvalidGroup.NotFound) when calling the ${op} operation: The security group '${name ?? id}' does not exist`);
  return sg;
}

function changeState(w, a, op, during, final) {
  ec2Region(w, a);
  const ids = a.opt['instance-ids'];
  if (!ids?.length) fail('aws: error: the following arguments are required: --instance-ids');
  for (const id of ids) {
    if (!w.instances[id]) fail(`An error occurred (InvalidInstanceID.NotFound) when calling the ${op} operation: The instance ID '${id}' does not exist`,
      'Copia el InstanceId exacto que muestra aws ec2 describe-instances.');
    if (final === 'stopped' && w.instances[id].state === 'terminated')
      fail(`An error occurred (IncorrectInstanceState) when calling the ${op} operation: The instance '${id}' is not in a state from which it can be stopped.`);
  }
  const key = op === 'TerminateInstances' ? 'TerminatingInstances' : 'StoppingInstances';
  return json({ [key]: ids.map(id => {
    const prev = w.instances[id].state;
    w.instances[id].state = prev === 'terminated' ? prev : final;
    return { InstanceId: id, CurrentState: st(prev === 'terminated' ? prev : during), PreviousState: st(prev) };
  }) });
}

const COMMANDS = {
  sts: {
    'get-caller-identity': () => json({ UserId: 'AIDAQUESTEXAMPLE0001', Account: ACCOUNT, Arn: `arn:aws:iam::${ACCOUNT}:user/leo` }),
  },
  configure: {
    set(w, a) {
      const [key, value] = a.pos;
      if (!key || value === undefined) fail('aws: error: the following arguments are required: varname, value', 'Uso: aws configure set region us-east-2');
      if (key === 'region') w.region = value;
      return '';
    },
    get(w, a) {
      if (a.pos[0] !== 'region') fail('aws: error: the following arguments are required: varname', 'Uso: aws configure get region');
      if (!w.region) fail('(sin salida: no hay región configurada)', 'Primero: aws configure set region us-east-2');
      return w.region;
    },
  },
  s3: {
    mb(w, a) {
      const { bucket } = s3Uri(a.pos[0]);
      if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) || bucket.includes('..'))
        fail(`make_bucket failed: s3://${bucket} An error occurred (InvalidBucketName) when calling the CreateBucket operation: The specified bucket is not valid.`,
          'Nombre de 3 a 63 caracteres: solo minúsculas, números, puntos y guiones.');
      if (w.buckets[bucket])
        fail(`make_bucket failed: s3://${bucket} An error occurred (BucketAlreadyOwnedByYou) when calling the CreateBucket operation: Your previous request to create the named bucket succeeded and you already own it.`);
      addBucket(w, bucket);
      return `make_bucket: ${bucket}`;
    },
    cp(w, a) {
      const [src, dst] = a.pos;
      if (!src || !dst) fail('aws: error: the following arguments are required: paths', 'Uso: aws s3 cp <archivo-local> s3://<bucket>/<archivo>');
      const file = src.replace(/^\.\//, '');
      if (!Object.hasOwn(LOCAL_FILES, file))
        fail(`The user-provided path ${src} does not exist.`, `Archivos en tu carpeta: ${Object.keys(LOCAL_FILES).join(', ')}.`);
      const { bucket, key } = s3Uri(dst);
      const k = !key || key.endsWith('/') ? key + file : key;
      const target = `s3://${bucket}/${k}`;
      if (!w.buckets[bucket])
        fail(`upload failed: ./${file} to ${target} An error occurred (NoSuchBucket) when calling the PutObject operation: The specified bucket does not exist`,
          '¿Creaste el bucket con aws s3 mb? ¿Lo escribiste igual?');
      w.buckets[bucket].objects[k] = LOCAL_FILES[file].length;
      return `upload: ./${file} to ${target}`;
    },
    ls(w, a) {
      if (!a.pos[0]) return Object.keys(w.buckets).map(b => `${NOW} ${b}`).join('\n');
      const { bucket } = s3Uri(a.pos[0]);
      if (!w.buckets[bucket]) fail('An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist');
      return Object.entries(w.buckets[bucket].objects).map(([k, size]) => `${NOW} ${String(size).padStart(10)} ${k}`).join('\n');
    },
    website(w, a) {
      const { bucket } = s3Uri(a.pos[0]);
      const index = need(a, 'index-document');
      if (!w.buckets[bucket]) fail('An error occurred (NoSuchBucket) when calling the PutBucketWebsite operation: The specified bucket does not exist');
      w.buckets[bucket].website = { index, error: a.opt['error-document']?.[0] ?? null };
      return '';
    },
  },
  iam: {
    'create-user'(w, a) {
      const name = need(a, 'user-name');
      if (w.users[name]) fail(`An error occurred (EntityAlreadyExists) when calling the CreateUser operation: User with name ${name} already exists.`);
      w.users[name] = { policies: [] };
      return json({ User: { Path: '/', UserName: name, UserId: nextId(w, 'AIDAQUESTUSER'), Arn: `arn:aws:iam::${ACCOUNT}:user/${name}`, CreateDate: '2026-10-25T12:00:00+00:00' } });
    },
    'attach-user-policy'(w, a) {
      const name = need(a, 'user-name'), arn = need(a, 'policy-arn');
      if (!w.users[name]) fail(`An error occurred (NoSuchEntity) when calling the AttachUserPolicy operation: The user with name ${name} cannot be found.`);
      const m = /^arn:aws:iam::aws:policy\/(.+)$/.exec(arn);
      if (!m || !MANAGED_POLICIES.includes(m[1]))
        fail(`An error occurred (NoSuchEntity) when calling the AttachUserPolicy operation: Policy ${arn} does not exist or is not attachable.`,
          'Las políticas administradas por AWS tienen esta forma: arn:aws:iam::aws:policy/NombreDeLaPolitica');
      if (!w.users[name].policies.includes(arn)) w.users[name].policies.push(arn);
      return '';
    },
    'list-attached-user-policies'(w, a) {
      const name = need(a, 'user-name');
      if (!w.users[name]) fail(`An error occurred (NoSuchEntity) when calling the ListAttachedUserPolicies operation: The user with name ${name} cannot be found.`);
      return json({ AttachedPolicies: w.users[name].policies.map(arn => ({ PolicyName: arn.split('/').pop(), PolicyArn: arn })) });
    },
  },
  ec2: {
    'create-security-group'(w, a) {
      ec2Region(w, a);
      const name = need(a, 'group-name');
      need(a, 'description');
      if (w.sgs[name]) fail(`An error occurred (InvalidGroup.Duplicate) when calling the CreateSecurityGroup operation: The security group '${name}' already exists for VPC 'vpc-0a1b2c3d'`);
      addSg(w, name);
      return json({ GroupId: w.sgs[name].id });
    },
    'authorize-security-group-ingress'(w, a) {
      ec2Region(w, a);
      const sg = findSg(w, a, 'AuthorizeSecurityGroupIngress');
      const protocol = need(a, 'protocol'), port = need(a, 'port'), cidr = need(a, 'cidr');
      const [from, to = from] = port.split('-');
      if (sg.rules.some(r => r.protocol === protocol && r.port === port && r.cidr === cidr))
        fail(`An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: ${cidr}, ${protocol.toUpperCase()}, from port: ${from}, to port: ${to}, ALLOW" already exists`);
      sg.rules.push({ protocol, port, cidr });
      return json({ Return: true, SecurityGroupRules: [{
        SecurityGroupRuleId: nextId(w, 'sgr-0a1b2c3d4e5f6'), GroupId: sg.id, IsEgress: false,
        IpProtocol: protocol, FromPort: Number(from), ToPort: Number(to), CidrIpv4: cidr,
      }] });
    },
    'run-instances'(w, a) {
      ec2Region(w, a);
      const image = need(a, 'image-id'), type = need(a, 'instance-type');
      if (image !== AMI)
        fail(`An error occurred (InvalidAMIID.NotFound) when calling the RunInstances operation: The image id '[${image}]' does not exist`, `En este juego usa la AMI ${AMI}.`);
      if (!/^[a-z0-9]+\.[a-z0-9]+$/.test(type))
        fail(`An error occurred (InvalidParameterValue) when calling the RunInstances operation: Invalid value '${type}' for InstanceType.`);
      const groups = a.opt['security-groups'] ?? [];
      for (const g of groups) if (!w.sgs[g])
        fail(`An error occurred (InvalidGroup.NotFound) when calling the RunInstances operation: The security group '${g}' does not exist in default VPC 'vpc-0a1b2c3d'`);
      const count = Number(a.opt.count?.[0] ?? 1);
      if (!Number.isInteger(count) || count < 1 || count > 5)
        fail('An error occurred (InvalidParameterValue) when calling the RunInstances operation: Invalid value for count.', 'En este juego --count va de 1 a 5.');
      const ids = Array.from({ length: count }, () => launch(w, type, image, groups));
      return json({ Instances: ids.map(id => ({
        InstanceId: id, ImageId: image, InstanceType: type, State: st('pending'),
        SecurityGroups: groups.map(g => ({ GroupName: g, GroupId: w.sgs[g].id })),
      })) });
    },
    'describe-instances'(w, a) {
      ec2Region(w, a);
      const only = a.opt['instance-ids'];
      const list = Object.entries(w.instances).filter(([id]) => !only || only.includes(id));
      return json({ Reservations: list.map(([id, i]) => ({
        ReservationId: 'r-' + id.slice(2),
        Instances: [{ InstanceId: id, ImageId: i.image, InstanceType: i.type, State: st(i.state) }],
      })) });
    },
    'stop-instances': (w, a) => changeState(w, a, 'StopInstances', 'stopping', 'stopped'),
    'terminate-instances': (w, a) => changeState(w, a, 'TerminateInstances', 'shutting-down', 'terminated'),
  },
};

// Runs one command per line (a trailing \ continues the line) and stops at the first error, like the CLI would.
function runScript(src, world) {
  const out = [], cmds = [];
  for (const raw of src.replace(/\\\r?\n/g, ' ').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    out.push('$ ' + line);
    try {
      const [bin, svc, op, ...rest] = tokenize(line);
      if (bin !== 'aws') fail(`zsh: command not found: ${bin}`, 'Todos los comandos de este juego empiezan con aws.');
      if (!svc) fail('aws: error: the following arguments are required: command');
      if (!Object.hasOwn(COMMANDS, svc)) fail(`aws: error: argument command: Invalid choice: '${svc}'`, `Servicios de este juego: ${Object.keys(COMMANDS).join(', ')}.`);
      if (!op) fail('aws: error: the following arguments are required: operation');
      if (!Object.hasOwn(COMMANDS[svc], op))
        fail(`aws: error: argument operation: Invalid choice: '${op}'`, `Operaciones de ${svc} en este juego: ${Object.keys(COMMANDS[svc]).join(', ')}.`);
      const text = COMMANDS[svc][op](world, parseArgs(rest));
      cmds.push(`${svc} ${op}`);
      if (text) out.push(text);
    } catch (e) {
      if (!(e instanceof CliError)) throw e;
      return { ok: false, out, cmds, error: e.message };
    }
  }
  return { ok: true, out, cmds };
}

const STARTER = '# escribe un comando por línea\n\n';

const LEVELS = [
  {
    name: 'La Llave del Reino',
    theory: `
      <p>En la nube casi todo se hace con la <b>AWS CLI</b>: un programa de terminal que habla con AWS. Todos los comandos tienen la misma forma:</p>
      <pre>aws &lt;servicio&gt; &lt;operación&gt; --opciones</pre>
      <p>Antes de tocar nada, la primera pregunta es: <b>¿quién soy?</b> La CLI usa unas credenciales (guardadas en un <b>perfil</b>) y con ellas firma cada petición. Para comprobar con qué identidad estás trabajando:</p>
      <pre>aws sts get-caller-identity</pre>
      <p>Te devuelve tu número de cuenta (<code>Account</code>, 12 dígitos) y tu <code>Arn</code>, que es el "nombre completo" de tu identidad. En tu máquina real añadirías <code>--profile leo-glez</code>.</p>`,
    challenge: 'Averigua quién eres con <code>aws sts get-caller-identity</code>.',
    hint: 'Servicio: sts. Operación: get-caller-identity.',
    solution: 'aws sts get-caller-identity\n',
    check: (w, cmds) => cmds.includes('sts get-caller-identity') ? null : 'Ejecuta aws sts get-caller-identity para ver quién eres.',
  },
  {
    name: 'El Mapa de Regiones',
    setup: w => { w.region = null; },
    theory: `
      <p>AWS tiene centros de datos repartidos por el mundo, agrupados en <b>regiones</b> (por ejemplo <code>us-east-2</code> = Ohio). Cada región tiene varias <b>zonas de disponibilidad</b> (AZ): edificios separados para que, si uno cae, el otro siga.</p>
      <p>Casi todo lo que creas vive <b>en una región</b>. Se elige por cercanía a tus usuarios, precio y leyes. Algunos servicios, como IAM, son globales.</p>
      <pre>aws configure set region us-east-2   # guarda la región por defecto
aws configure get region             # la consulta</pre>
      <p>Si no hay región configurada, muchos comandos fallan con <code>You must specify a region</code>.</p>`,
    challenge: 'Configura la región <code>us-east-2</code> y después compruébala con <code>aws configure get region</code>.',
    hint: 'Dos líneas: primero aws configure set region us-east-2, luego aws configure get region.',
    solution: 'aws configure set region us-east-2\naws configure get region\n',
    check(w, cmds) {
      if (w.region !== 'us-east-2') return `La región quedó en ${w.region ?? '(ninguna)'}; el reto pide us-east-2 (Ohio).`;
      if (!cmds.includes('configure get')) return 'Comprueba la región con aws configure get region.';
      return null;
    },
  },
  {
    name: 'El Cofre Infinito',
    theory: `
      <p><b>S3</b> (Simple Storage Service) guarda archivos, que en S3 se llaman <b>objetos</b>. Los objetos viven dentro de un <b>bucket</b>: un contenedor con nombre.</p>
      <p>El nombre del bucket es <b>único en todo AWS</b> (entre todas las cuentas del mundo), de 3 a 63 caracteres, solo minúsculas, números, puntos y guiones.</p>
      <pre>aws s3 mb s3://mi-bucket-unico   # mb = make bucket
aws s3 ls                        # lista tus buckets</pre>`,
    challenge: 'Crea el bucket <code>cofre-leo-2026</code> y después lista tus buckets.',
    hint: 'aws s3 mb s3://cofre-leo-2026  y luego  aws s3 ls',
    solution: 'aws s3 mb s3://cofre-leo-2026\naws s3 ls\n',
    check(w, cmds) {
      if (!w.buckets['cofre-leo-2026']) return 'No existe el bucket cofre-leo-2026.';
      if (!cmds.includes('s3 ls')) return 'Lista tus buckets con aws s3 ls para comprobarlo.';
      return null;
    },
  },
  {
    name: 'El Mapa del Tesoro',
    setup: w => addBucket(w, 'cofre-leo-2026'),
    theory: `
      <p>Para subir un archivo se usa <code>aws s3 cp</code> (copiar): <b>origen</b> y luego <b>destino</b>.</p>
      <pre>aws s3 cp foto.png s3://mi-bucket/fotos/foto.png
aws s3 ls s3://mi-bucket/fotos/</pre>
      <p>La ruta dentro del bucket (<code>fotos/foto.png</code>) se llama <b>clave</b> (key). Parece una carpeta, pero S3 es plano: la "carpeta" es solo parte del nombre.</p>
      <p>En tu carpeta local hay: <code>mapa.txt</code>, <code>index.html</code> y <code>error.html</code>.</p>`,
    challenge: 'Sube <code>mapa.txt</code> al bucket <code>cofre-leo-2026</code> (clave <code>mapa.txt</code>) y lista el contenido del bucket.',
    hint: 'aws s3 cp mapa.txt s3://cofre-leo-2026/mapa.txt  y luego  aws s3 ls s3://cofre-leo-2026',
    solution: 'aws s3 cp mapa.txt s3://cofre-leo-2026/mapa.txt\naws s3 ls s3://cofre-leo-2026\n',
    check(w, cmds) {
      if (!w.buckets['cofre-leo-2026'].objects['mapa.txt']) return 'El objeto mapa.txt no está en s3://cofre-leo-2026/.';
      if (!cmds.includes('s3 ls')) return 'Lista el bucket con aws s3 ls s3://cofre-leo-2026 para comprobarlo.';
      return null;
    },
  },
  {
    name: 'El Gremio de Aprendices',
    theory: `
      <p>Tu cuenta tiene un usuario <b>root</b> (el email con el que la creaste) que lo puede todo. Regla de oro: <b>no lo uses para el día a día</b>, protégelo con MFA y guárdalo.</p>
      <p>Para trabajar se usa <b>IAM</b> (Identity and Access Management): creas <b>usuarios</b>, <b>grupos</b> y <b>roles</b>, y decides qué puede hacer cada uno. IAM es global: no depende de la región.</p>
      <pre>aws iam create-user --user-name ana</pre>`,
    challenge: 'Crea el usuario IAM <code>aprendiz</code>.',
    hint: 'aws iam create-user --user-name ...',
    solution: 'aws iam create-user --user-name aprendiz\n',
    check: w => w.users.aprendiz ? null : 'No existe el usuario aprendiz.',
  },
  {
    name: 'Las Llaves Justas',
    setup: w => { w.users.aprendiz = { policies: [] }; },
    theory: `
      <p>Un usuario recién creado <b>no puede hacer nada</b>. Los permisos se dan con <b>políticas</b>: documentos JSON que dicen qué acciones se permiten sobre qué recursos.</p>
      <p>AWS trae políticas ya hechas ("administradas por AWS"). Se identifican por su ARN:</p>
      <pre>arn:aws:iam::aws:policy/AdministratorAccess      # TODO (peligroso)
arn:aws:iam::aws:policy/AmazonS3FullAccess       # S3 completo, incluido borrar
arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess   # S3 solo lectura

aws iam attach-user-policy --user-name ana --policy-arn &lt;arn&gt;
aws iam list-attached-user-policies --user-name ana</pre>
      <p><b>Principio de mínimo privilegio:</b> da solo los permisos que hacen falta. Si roban esas credenciales, el daño queda limitado.</p>`,
    challenge: '<code>aprendiz</code> solo necesita <b>leer</b> S3. Dale la política justa y compruébalo con <code>list-attached-user-policies</code>.',
    hint: 'La política es AmazonS3ReadOnlyAccess. El ARN empieza por arn:aws:iam::aws:policy/',
    solution: `aws iam attach-user-policy --user-name aprendiz --policy-arn ${READ_ONLY}\naws iam list-attached-user-policies --user-name aprendiz\n`,
    check(w, cmds) {
      const p = w.users.aprendiz.policies;
      if (p.some(arn => /AdministratorAccess|AmazonS3FullAccess/.test(arn)))
        return 'Le diste más permisos de los necesarios. Principio de mínimo privilegio: solo leer S3.';
      if (!p.includes(READ_ONLY)) return 'aprendiz todavía no tiene AmazonS3ReadOnlyAccess.';
      if (!cmds.includes('iam list-attached-user-policies')) return 'Comprueba con aws iam list-attached-user-policies --user-name aprendiz.';
      return null;
    },
  },
  {
    name: 'La Muralla de Fuego',
    theory: `
      <p>Un <b>security group</b> es un firewall virtual para tus servidores. Por defecto <b>bloquea todo lo que entra</b>; tú añades reglas para permitir puertos concretos.</p>
      <p>Una regla dice: protocolo, puerto y desde dónde (un rango <b>CIDR</b>). <code>0.0.0.0/0</code> significa "todo internet".</p>
      <pre>aws ec2 create-security-group --group-name mi-sg --description "mi firewall"
aws ec2 authorize-security-group-ingress --group-name mi-sg \\
  --protocol tcp --port 443 --cidr 0.0.0.0/0</pre>
      <p>Puertos típicos: <b>80</b> HTTP, <b>443</b> HTTPS, <b>22</b> SSH. Nunca abras el 22 a todo internet: usa tu IP (<code>x.x.x.x/32</code>) o Session Manager.</p>`,
    challenge: 'Crea el security group <code>web-sg</code> y permite la entrada <b>HTTP</b> (tcp, puerto 80) desde todo internet.',
    hint: 'Primero create-security-group (necesita --description), luego authorize-security-group-ingress con --protocol tcp --port 80 --cidr 0.0.0.0/0',
    solution: 'aws ec2 create-security-group --group-name web-sg --description "web publica"\naws ec2 authorize-security-group-ingress --group-name web-sg --protocol tcp --port 80 --cidr 0.0.0.0/0\n',
    check(w) {
      const sg = w.sgs['web-sg'];
      if (!sg) return 'No existe el security group web-sg.';
      if (sg.rules.some(r => r.port === '22' && r.cidr === '0.0.0.0/0'))
        return 'Abriste el puerto 22 (SSH) a todo internet: es la puerta favorita de los atacantes. El reto pide solo el 80.';
      if (!sg.rules.some(r => r.protocol === 'tcp' && r.port === '80' && r.cidr === '0.0.0.0/0'))
        return 'Falta la regla tcp, puerto 80, desde 0.0.0.0/0.';
      return null;
    },
  },
  {
    name: 'El Gólem de Cómputo',
    setup: w => addSg(w, 'web-sg', [{ protocol: 'tcp', port: '80', cidr: '0.0.0.0/0' }]),
    theory: `
      <p><b>EC2</b> te alquila servidores virtuales llamados <b>instancias</b>. Para lanzar una necesitas:</p>
      <p>· una <b>AMI</b>: la imagen del sistema operativo (la "plantilla" del disco).<br>
      · un <b>tipo de instancia</b>: el tamaño (CPU y RAM). <code>t3.micro</code> es pequeña y barata; los tipos grandes cuestan mucho más por hora.<br>
      · un <b>security group</b>: el firewall de la instancia.</p>
      <pre>aws ec2 run-instances --image-id ${AMI} \\
  --instance-type t3.micro --security-groups web-sg --count 1</pre>
      <p>Pagas mientras la instancia está encendida. (La AMI de este juego es ficticia; en AWS real los IDs de AMI cambian según la región.)</p>`,
    challenge: 'Lanza <b>1</b> instancia <code>t3.micro</code> con la AMI <code>' + AMI + '</code> y el security group <code>web-sg</code>.',
    hint: 'aws ec2 run-instances con --image-id, --instance-type, --security-groups y --count 1',
    solution: `aws ec2 run-instances --image-id ${AMI} --instance-type t3.micro --security-groups web-sg --count 1\n`,
    check(w) {
      const running = Object.values(w.instances).filter(i => i.state === 'running');
      const pricey = running.find(i => !CHEAP_TYPES.includes(i.type));
      if (pricey) return `Lanzaste una ${pricey.type}: cuesta mucho más por hora. Para aprender usa t3.micro.`;
      if (!running.length) return 'No hay ninguna instancia corriendo.';
      if (running.length > 1) return `Lanzaste ${running.length} instancias; el reto pide solo 1 (cada una se cobra).`;
      if (!running[0].groups.includes('web-sg')) return 'La instancia debe usar el security group web-sg.';
      return null;
    },
  },
  {
    name: 'Apaga la Fragua',
    setup: w => { addSg(w, 'web-sg'); launch(w, 't3.micro', AMI, ['web-sg']); },
    theory: `
      <p>Una instancia encendida <b>cobra aunque nadie la use</b>. Olvidarse de apagar cosas es la causa número uno de facturas sorpresa.</p>
      <p>· <code>stop-instances</code>: la apaga. No pagas cómputo, pero su <b>disco (EBS) sigue cobrando</b>.<br>
      · <code>terminate-instances</code>: la <b>elimina</b> para siempre.</p>
      <pre>aws ec2 describe-instances                          # ¿qué tengo y cuál es su ID?
aws ec2 terminate-instances --instance-ids i-xxxxxxxx</pre>
      <p>En la vida real no sabes los IDs de memoria: primero los consultas.</p>`,
    challenge: 'Hay una instancia olvidada. Descubre su ID con <code>describe-instances</code> y <b>termínala</b>.',
    hint: 'Ejecuta primero aws ec2 describe-instances, copia el InstanceId y úsalo en terminate-instances --instance-ids',
    solution: 'aws ec2 describe-instances\naws ec2 terminate-instances --instance-ids i-0a1b2c3d4e5f60001\n',
    check(w, cmds) {
      const i = w.instances['i-0a1b2c3d4e5f60001'];
      if (i.state === 'stopped') return 'Detenida no basta: su disco (EBS) sigue cobrando. Termínala.';
      if (i.state !== 'terminated') return 'La instancia sigue encendida.';
      const d = cmds.indexOf('ec2 describe-instances'), t = cmds.indexOf('ec2 terminate-instances');
      if (d < 0 || d > t) return 'Primero averigua el ID con aws ec2 describe-instances: en la vida real no lo sabes de memoria.';
      return null;
    },
  },
  {
    name: 'JEFE FINAL: El Castillo en las Nubes',
    theory: `
      <p>¡Hora de combinarlo todo! S3 puede servir una <b>web estática</b> (HTML, CSS, JS, imágenes) sin ningún servidor:</p>
      <pre>aws s3 website s3://mi-bucket/ --index-document index.html --error-document error.html</pre>
      <p><code>index-document</code> es la página principal y <code>error-document</code> la que se muestra cuando algo no existe.</p>
      <p>En AWS real los buckets nuevos <b>bloquean el acceso público</b> por defecto. Para publicar habría que cambiar eso y añadir una política al bucket, o mejor, poner <b>CloudFront</b> delante (lo recomendado). Aquí solo practicamos los pasos de S3.</p>`,
    challenge: 'Crea el bucket <code>castillo-leo-2026</code>, sube <code>index.html</code> y <code>error.html</code>, y actívalo como sitio web con esas dos páginas.',
    hint: 'Cuatro comandos: s3 mb, dos s3 cp y s3 website con --index-document y --error-document.',
    solution: 'aws s3 mb s3://castillo-leo-2026\naws s3 cp index.html s3://castillo-leo-2026/\naws s3 cp error.html s3://castillo-leo-2026/\naws s3 website s3://castillo-leo-2026/ --index-document index.html --error-document error.html\n',
    check(w) {
      const b = w.buckets['castillo-leo-2026'];
      if (!b) return 'No existe el bucket castillo-leo-2026.';
      for (const f of ['index.html', 'error.html']) if (!b.objects[f]) return `Falta subir ${f} al bucket.`;
      if (!b.website) return 'El bucket aún no está configurado como sitio web (aws s3 website).';
      if (b.website.index !== 'index.html' || b.website.error !== 'error.html')
        return 'El sitio debe usar --index-document index.html y --error-document error.html.';
      return null;
    },
  },
].map(lv => ({ starter: STARTER, ...lv }));

// Every run starts from the level's own world, so levels can be replayed in any order.
function play(level, src) {
  const world = newWorld();
  level.setup?.(world);
  const res = runScript(src, world);
  if (!res.ok) return { pass: false, cli: true, out: res.out, msg: res.error };
  if (!res.cmds.length) return { pass: false, out: res.out, msg: 'No escribiste ningún comando.' };
  const msg = level.check(world, res.cmds);
  return msg ? { pass: false, out: res.out, msg } : { pass: true, out: res.out };
}

export { LEVELS, play };
