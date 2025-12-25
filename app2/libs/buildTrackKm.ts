import { File, Paths } from 'expo-file-system'
import { Asset } from 'expo-asset'

export type Point = {
    km: number
    lat: number
    lon: number
}

export type TrackKm = {
    points: Point[]
    kmToIndex: Map<number, number>
}

export async function buildTrackKm(): Promise<TrackKm> {
    const [{ localUri }] = await Asset.loadAsync(
        require('@/assets/data/km2coord.csv'),
    )

    if (!localUri) {
        throw new Error('Asset not found')
    }
    const content = await new File(localUri).text().then((text) => text.trim())
    const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    const points: Point[] = []
    const kmToIndex = new Map<number, number>()

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',')

        if (parts.length < 3) {
            continue
        }

        const km = Number(parts[0])
        const lat = Number(parts[1])
        const lon = Number(parts[2])

        if (Number.isNaN(km) || Number.isNaN(lat) || Number.isNaN(lon)) {
            continue
        }

        const point: Point = { km, lat, lon }

        kmToIndex.set(km, points.length)
        points.push(point)
    }
    return { points, kmToIndex }
}
