'use client';

import {
  formatDimCm,
  formatDimM,
  getBlueprintDimensions,
  type BlueprintDimensions,
} from '@/lib/builder/blueprintDimensions';

type Point = { x: number; y: number };

type Props = {
  slug: string | null | undefined;
  title?: string;
  className?: string;
};

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

function iso(x: number, y: number, z: number, cx: number, cy: number, scale: number): Point {
  return {
    x: cx + (x - y) * COS30 * scale,
    y: cy - z * scale + (x + y) * SIN30 * scale,
  };
}

function line(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

function dimLabel(cm: string, meters: string): string {
  return `${cm} / ${meters}`;
}

function DimensionLine({
  a,
  b,
  label,
  offsetX = 0,
  offsetY = 0,
  textAnchor = 'middle' as 'start' | 'middle' | 'end',
}: {
  a: Point;
  b: Point;
  label: string;
  offsetX?: number;
  offsetY?: number;
  textAnchor?: 'start' | 'middle' | 'end';
}) {
  const mx = (a.x + b.x) / 2 + offsetX;
  const my = (a.y + b.y) / 2 + offsetY;
  return (
    <g className="text-[9px] font-medium" fill="#111" stroke="#111">
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={0.6} />
      <polygon
        points={`${a.x},${a.y} ${a.x + 3},${a.y - 1.5} ${a.x + 3},${a.y + 1.5}`}
        fill="#111"
        stroke="none"
      />
      <polygon
        points={`${b.x},${b.y} ${b.x - 3},${b.y - 1.5} ${b.x - 3},${b.y + 1.5}`}
        fill="#111"
        stroke="none"
      />
      <text x={mx} y={my} textAnchor={textAnchor} dominantBaseline="middle" stroke="none">
        {label}
      </text>
    </g>
  );
}

function drawGazebo(d: BlueprintDimensions, cx: number, cy: number, scale: number) {
  const { facadeM, depthM, ridgeM, overhangM, glazed } = d;
  const roofW = facadeM + overhangM * 2;
  const roofD = depthM + overhangM * 2;
  const wallH = glazed ? 2.0 : ridgeM * 0.72;
  const ridgeZ = ridgeM;

  const base = {
    fl: iso(0, 0, 0, cx, cy, scale),
    fr: iso(facadeM, 0, 0, cx, cy, scale),
    br: iso(facadeM, depthM, 0, cx, cy, scale),
    bl: iso(0, depthM, 0, cx, cy, scale),
  };

  const roofBase = {
    fl: iso(-overhangM, -overhangM, wallH, cx, cy, scale),
    fr: iso(facadeM + overhangM, -overhangM, wallH, cx, cy, scale),
    br: iso(facadeM + overhangM, depthM + overhangM, wallH, cx, cy, scale),
    bl: iso(-overhangM, depthM + overhangM, wallH, cx, cy, scale),
  };

  const ridgeFront = iso(facadeM / 2, -overhangM, ridgeZ, cx, cy, scale);
  const ridgeBack = iso(facadeM / 2, depthM + overhangM, ridgeZ, cx, cy, scale);

  const posts = [
    [base.fl, iso(0, 0, wallH, cx, cy, scale)],
    [base.fr, iso(facadeM, 0, wallH, cx, cy, scale)],
    [base.br, iso(facadeM, depthM, wallH, cx, cy, scale)],
    [base.bl, iso(0, depthM, wallH, cx, cy, scale)],
  ] as const;

  return { base, roofBase, ridgeFront, ridgeBack, posts, roofW, roofD, wallH, ridgeZ, facadeM, depthM };
}

export default function BlueprintCover({ slug, title, className = '' }: Props) {
  const dims = getBlueprintDimensions(slug);
  const cx = 200;
  const cy = 150;
  const maxSpan = Math.max(dims.facadeM, dims.depthM);
  const scale = 42 / maxSpan;

  const g = drawGazebo(dims, cx, cy, scale);

  const roofFrontLeft = g.roofBase.fl;
  const roofFrontRight = g.roofBase.fr;
  const roofBackLeft = g.roofBase.bl;
  const roofBackRight = g.roofBase.br;

  const widthDimA = { x: roofFrontLeft.x - 18, y: roofFrontLeft.y - 14 };
  const widthDimB = { x: roofFrontRight.x + 18, y: roofFrontRight.y - 14 };

  const depthDimA = { x: roofFrontRight.x + 22, y: roofFrontRight.y - 6 };
  const depthDimB = { x: roofBackRight.x + 22, y: roofBackRight.y + 6 };

  const heightDimA = { x: g.base.fr.x + 36, y: g.base.fr.y };
  const heightDimB = { x: g.ridgeFront.x + 36, y: g.ridgeFront.y - 4 };

  const wallDimA = { x: g.base.fr.x + 52, y: g.base.fr.y };
  const wallDimB = { x: g.posts[1][1].x + 52, y: g.posts[1][1].y };

  return (
    <div
      className={`blueprint-cover overflow-hidden rounded-DEFAULT border border-border bg-white ${className}`}
      aria-label={title ? `Чертёж: ${title}` : 'Чертёж беседки'}
    >
      <svg viewBox="0 0 400 240" className="aspect-[5/3] w-full" role="img">
        <defs>
          <pattern id="bp-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#e8e8e8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#bp-grid)" />

        <g fill="none" stroke="#1a1a1a" strokeWidth={1.2} strokeLinejoin="round">
          {/* Платформа */}
          <path d={line([g.base.fl, g.base.fr, g.base.br, g.base.bl, g.base.fl])} />

          {/* Стойки */}
          {g.posts.map(([bottom, top], i) => (
            <line key={i} x1={bottom.x} y1={bottom.y} x2={top.x} y2={top.y} />
          ))}

          {/* Каркас под кровлей */}
          <path d={line([g.roofBase.fl, g.roofBase.fr, g.roofBase.br, g.roofBase.bl, g.roofBase.fl])} />

          {/* Кровля */}
          <path d={line([roofFrontLeft, g.ridgeFront, roofFrontRight])} />
          <path d={line([roofBackLeft, g.ridgeBack, roofBackRight])} />
          <path d={line([g.ridgeFront, g.ridgeBack])} />
          <path d={line([roofFrontLeft, roofBackLeft])} />
          <path d={line([roofFrontRight, roofBackRight])} />

          {/* Линии ската */}
          <line x1={g.ridgeFront.x} y1={g.ridgeFront.y} x2={roofFrontLeft.x} y2={roofFrontLeft.y} strokeWidth={0.7} />
          <line x1={g.ridgeFront.x} y1={g.ridgeFront.y} x2={roofFrontRight.x} y2={roofFrontRight.y} strokeWidth={0.7} />
          <line x1={g.ridgeBack.x} y1={g.ridgeBack.y} x2={roofBackLeft.x} y2={roofBackLeft.y} strokeWidth={0.7} />
          <line x1={g.ridgeBack.x} y1={g.ridgeBack.y} x2={roofBackRight.x} y2={roofBackRight.y} strokeWidth={0.7} />

          {dims.glazed ? (
            <>
              <path
                d={line([
                  iso(0, 0, g.wallH * 0.35, cx, cy, scale),
                  iso(g.facadeM, 0, g.wallH * 0.35, cx, cy, scale),
                  iso(g.facadeM, g.depthM, g.wallH * 0.35, cx, cy, scale),
                  iso(0, g.depthM, g.wallH * 0.35, cx, cy, scale),
                  iso(0, 0, g.wallH * 0.35, cx, cy, scale),
                ])}
                strokeWidth={0.8}
                strokeDasharray="4 3"
              />
            </>
          ) : null}
        </g>

        <DimensionLine
          a={widthDimA}
          b={widthDimB}
          label={dimLabel(formatDimCm(g.roofW), formatDimM(g.roofW))}
          offsetY={-10}
        />
        <DimensionLine
          a={depthDimA}
          b={depthDimB}
          label={dimLabel(formatDimCm(g.roofD), formatDimM(g.roofD))}
          offsetX={12}
        />
        <DimensionLine
          a={heightDimA}
          b={heightDimB}
          label={dimLabel(formatDimCm(g.ridgeZ), formatDimM(g.ridgeZ))}
          offsetX={8}
        />
        <DimensionLine
          a={wallDimA}
          b={wallDimB}
          label={dimLabel(formatDimCm(g.wallH), formatDimM(g.wallH))}
          offsetX={8}
        />

        <text x="12" y="228" className="fill-neutral-400 text-[8px]" stroke="none">
          Схема · масштаб условный
        </text>
      </svg>
    </div>
  );
}
