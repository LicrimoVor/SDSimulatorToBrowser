import { Point, TrackKm } from './buildTrackKm'

function findNearestBaseIndex(base: Point[], km: number): number {
    let min = Infinity
    let idx = 0

    for (let i = 0; i < base.length; i++) {
        const d = Math.abs(base[i].km - km)
        if (d < min) {
            min = d
            idx = i
        }
    }
    return idx
}
function normalize(x: number, y: number): [number, number] {
    const l = Math.hypot(x, y)
    return l === 0 ? [0, 0] : [x / l, y / l]
}

function rotate(x: number, y: number, angle: number): [number, number] {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return [x * c - y * s, x * s + y * c]
}

function cross(ax: number, ay: number, bx: number, by: number): number {
    return ax * by - ay * bx
}

function dot(ax: number, ay: number, bx: number, by: number): number {
    return ax * bx + ay * by
}

export function buildStrokeTrack(
    track: Point[],
    base: Point[],
    maxOffset = 0.03,
): Point[] {
    const res: Point[] = []
    const step = maxOffset / track.length

    let prevT: [number, number] | undefined
    let normal: [number, number] | undefined

    for (let i = 0; i < track.length; i++) {
        const idx = findNearestBaseIndex(base, track[i].km)
        const p = base[idx]

        // касательная из базы
        const pPrev = base[Math.max(0, idx - 1)]
        const pNext = base[Math.min(base.length - 1, idx + 1)]

        let T: [number, number] = normalize(
            pNext.lon - pPrev.lon,
            pNext.lat - pPrev.lat,
        )

        if (!prevT) {
            // инициализация нормали
            normal = normalize(-T[1], T[0])
        } else {
            // угол между касательными
            const angle = Math.atan2(
                cross(prevT[0], prevT[1], T[0], T[1]),
                dot(prevT[0], prevT[1], T[0], T[1]),
            )

            // параллельный перенос
            normal = rotate(normal![0], normal![1], angle)
            normal = normalize(normal[0], normal[1])
        }

        prevT = T

        // ограничение роста смещения (важно!)
        const offset = Math.min(step * i, maxOffset)

        res.push({
            lon: p.lon + normal![0] * offset,
            lat: p.lat + normal![1] * offset,
            km: track[i].km,
        })
    }

    return res
}
