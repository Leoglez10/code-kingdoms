// Tile map shared by every world map: 20x12 tiles of 16px, a U-shaped path like the original games.
export const T = 16, COLS = 20, ROWS = 12;

export const isPath = (x, y) => ((y === 3 || y === 10) && x >= 1 && x <= 17) || (x === 17 && y >= 3 && y <= 10);

// Path tiles in walking order: top row left→right, down the right side, bottom row right→left.
const ROUTE = [
  ...Array.from({ length: 17 }, (_, i) => [i + 1, 3]),
  ...Array.from({ length: 7 }, (_, i) => [17, i + 4]),
  ...Array.from({ length: 16 }, (_, i) => [16 - i, 10]),
];

// Spreads n stations evenly along the route, each placed on the grass right beside the path.
export function stationTiles(n) {
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = ROUTE[n === 1 ? 0 : Math.round((i * (ROUTE.length - 1)) / (n - 1))];
    return x === 17 && y > 3 ? [18, y] : [x, y - 1];
  });
}

// The path tile next to a station, where Leo stands when arriving.
export const standTile = ([x, y]) => (x === 18 ? [17, y] : [x, y + 1]);
