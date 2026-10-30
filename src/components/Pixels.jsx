// Renders a pixel sprite: rows of chars, each char mapped to a color ('.' is transparent).
export default function Pixels({ rows, colors, size = 4, className, title }) {
  const w = rows[0].length, h = rows.length;
  return (
    <svg className={className} width={w * size} height={h * size} viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {rows.flatMap((row, y) => [...row].map((c, x) => c === '.' ? null :
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} />))}
    </svg>
  );
}

export const CASTLE = [
  'k.k.k..k.k.k',
  'kkkkk..kkkkk',
  'kdkdk..kdkdk',
  'kkkkkkkkkkkk',
  'kkkkkkkkkkkk',
  'kkdkkkkkkdkk',
  'kkkkkkkkkkkk',
  'kkkkkddkkkkk',
  'kkkkddddkkkk',
  'kkkkddddkkkk',
];

export const GEM = ['..gg..', '.gggg.', '.wggg.', 'gggggg', 'gggggg', 'gggggg', '.gggg.', '.gggg.', '..gg..'];
