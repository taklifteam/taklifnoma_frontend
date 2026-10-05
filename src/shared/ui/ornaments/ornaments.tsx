// To'y bezaklari — dizaynning o'ziga xos qismi. Hammasi bezak: aria-hidden.

import { useId } from 'react'
import { cn } from '../../lib/cn'
import s from './ornaments.module.css'

/** SVG gradient id uchun: useId'dagi belgilar url(#...) da ishlamaydi. */
function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, '')
}

type Item = { x: number; y: number; r?: number; rot?: number }

// Koordinatalar 1440×900 maydonda; sahna ekran o'lchamiga cho'ziladi (slice — kesib to'ldiradi).
const COINS: Item[][] = [
  [{ x: 190, y: 140, r: 16 }, { x: 1230, y: 250, r: 14 }, { x: 380, y: 700, r: 13 }, { x: 1100, y: 760, r: 18 }],
  [{ x: 90, y: 430, r: 15 }, { x: 1360, y: 120, r: 12 }, { x: 860, y: 70, r: 11 }],
  [{ x: 560, y: 820, r: 10 }, { x: 1300, y: 820, r: 13 }, { x: 250, y: 560, r: 9 }],
]
const PETALS: Item[][] = [
  [{ x: 300, y: 300, rot: 25 }, { x: 1340, y: 520, rot: -35 }],
  [{ x: 420, y: 90, rot: 60 }, { x: 1180, y: 620, rot: 10 }, { x: 240, y: 820, rot: -60 }],
  [{ x: 1050, y: 190, rot: -20 }, { x: 130, y: 250, rot: 40 }, { x: 900, y: 840, rot: 70 }],
]
const NAVVOT: Item[][] = [
  [{ x: 530, y: 120 }, { x: 1012, y: 140 }],
  [{ x: 171, y: 600 }, { x: 1290, y: 380 }, { x: 650, y: 830 }],
  [{ x: 709, y: 60 }, { x: 1399, y: 690 }],
]

/**
 * Sochqi — kelin-kuyovga sochiladigan tanga, navvot va gul barglari. Butun blokni qoplaydi,
 * o'rtada pushti nur. Elementlar sekin tebranadi (harakat kamaytirilgan rejimda to'xtaydi).
 */
export function SochqiScene({ className }: { className?: string }) {
  const coin = useSvgId('tanga')
  const petal = useSvgId('barg')
  const glow = useSvgId('nur')
  const groups = [s.sway1, s.sway2, s.sway3]
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className={cn(s.scene, className)}>
      <defs>
        <radialGradient id={coin} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="var(--gold-100)" />
          <stop offset="0.6" stopColor="var(--gold-500)" />
          <stop offset="1" stopColor="var(--gold-700)" />
        </radialGradient>
        <radialGradient id={petal} cx="30%" cy="30%" r="80%">
          <stop offset="0" stopColor="var(--petal-100)" />
          <stop offset="1" stopColor="var(--petal-500)" />
        </radialGradient>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--rose-100)" />
          <stop offset="1" stopColor="var(--rose-100)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="720" cy="470" r="520" fill={`url(#${glow})`} />
      {groups.map((cls, i) => (
        <g key={cls} className={cls}>
          {COINS[i]!.map(({ x, y, r = 12 }) => (
            <g key={`c${x}`}>
              <circle cx={x} cy={y} r={r} fill={`url(#${coin})`} />
              <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke="var(--gold-700)" strokeWidth="1.5" />
            </g>
          ))}
          {PETALS[i]!.map(({ x, y, rot = 0 }) => (
            <ellipse key={`p${x}`} cx={x} cy={y} rx="16" ry="9" fill={`url(#${petal})`} transform={`rotate(${rot} ${x} ${y})`} />
          ))}
          {NAVVOT[i]!.map(({ x, y }) => (
            <polygon
              key={`n${x}`}
              points={`${x - 10},${y} ${x},${y - 12} ${x + 10},${y} ${x},${y + 12}`}
              fill="var(--navvot)"
              stroke="var(--navvot-line)"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Bir-biriga kirgan ikki nikoh uzugi va yulduzcha. */
export function Rings({ className }: { className?: string }) {
  const id = useSvgId('uzuk')
  return (
    <svg aria-hidden="true" width="110" height="62" viewBox="0 0 110 62" className={className}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#f6de94" />
          <stop offset="0.5" stopColor="#c9962f" />
          <stop offset="1" stopColor="#f3d27d" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="36" r="22" fill="none" stroke={`url(#${id})`} strokeWidth="6" />
      <circle cx="70" cy="36" r="22" fill="none" stroke={`url(#${id})`} strokeWidth="6" />
      <path d="M70 4 l3 6 6 2 -6 2 -3 6 -3 -6 -6 -2 6 -2z" fill="var(--gold)" />
    </svg>
  )
}
