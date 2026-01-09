import { TrackKm } from './buildTrackKm'

type FindOptions = {
    last_km?: number
    window?: number
    snapThreshold?: number
}

export function coord2km(
    Km: TrackKm,
    lat: number,
    lon: number,
    options: FindOptions = {},
): number {
    const {
        last_km,
        window = 20,
        snapThreshold = 0.00005, // ≈ 5 м
    } = options

    const points = Km.points
    const kmToIndex = Km.kmToIndex

    let start = 0
    let end = points.length - 1

    // --- 1. Локальное окно ---
    if (last_km !== undefined && kmToIndex.has(last_km)) {
        const center = kmToIndex.get(last_km)!
        start = Math.max(0, center - window)
        end = Math.min(points.length - 1, center + window)
    }

    let minDist = Infinity
    let bestKm = start

    // --- 2. Линейный поиск в окне ---
    for (let i = start; i <= end; i++) {
        const dLat = points[i].lat - lat
        const dLon = points[i].lon - lon
        const d = dLat * dLat + dLon * dLon

        if (d < minDist) {
            minDist = d
            bestKm = i
        }
    }

    // --- 3. Анти-дребезг (GPS noise) ---
    if (last_km !== undefined && kmToIndex.has(last_km)) {
        const prevIdx = kmToIndex.get(last_km)!
        const prevPoint = points[prevIdx]

        const dLat = prevPoint.lat - lat
        const dLon = prevPoint.lon - lon
        const drift = dLat * dLat + dLon * dLon

        if (drift < snapThreshold * snapThreshold) {
            return last_km
        }
    }

    return points[bestKm].km
}
