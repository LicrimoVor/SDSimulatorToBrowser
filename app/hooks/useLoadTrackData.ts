import { LOCATION_TASK_TRACK_KM } from '@/core/tasks'
import { buildStrokeTrack } from '@/libs/buildStrokeTrack'
import { Point, TrackKm } from '@/libs/buildTrackKm'
import { getLocationFromFile } from '@/libs/locations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { useInitialEffect } from './useInitialEffect'

export type AnyPoint = {
    lon: number
    latBase?: number
    latTrack?: number
    km: number
    trackTime?: number
}

async function loadTrackData(filename: string) {
    const trackKmRaw = await AsyncStorage.getItem(LOCATION_TASK_TRACK_KM)
    if (!trackKmRaw) return null

    const data = await getLocationFromFile(filename)
    if (!data.length) return null

    const trackPoints: Point[] = data.map((d) => ({
        lat: d.latitude,
        lon: d.longitude,
        km: d.km,
    }))

    const { points: basePoints } = JSON.parse(trackKmRaw) as TrackKm

    const strokePoints = buildStrokeTrack(trackPoints, basePoints, 0.005)

    const timeStart = data[0].timestamp

    const minMaxKm: [number, number] = strokePoints.reduce(
        (acc, p) => [Math.min(acc[0], p.km), Math.max(acc[1], p.km)],
        [strokePoints[0].km, strokePoints[0].km],
    )

    const allPoints: AnyPoint[] = [
        ...basePoints.map((p) => ({
            lon: p.lon,
            latBase: p.lat,
            km: p.km,
        })),
        ...strokePoints.map((p, i) => ({
            lon: p.lon,
            latTrack: p.lat,
            trackTime: timeStart - data[i].timestamp + i,
            km: p.km,
        })),
    ]

    return {
        allPoints,
        minMaxKm,
        maxTime: data.length,
    }
}

export const useLoadTrackData = (filename: string) => {
    const [allPoints, setAllPoints] = useState<AnyPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [minMaxKm, setMinMaxKm] = useState<[number, number]>([0, 0])
    const [maxTime, setMaxTime] = useState(0)

    useInitialEffect(() => {
        let cancelled = false
        ;(async () => {
            if (isLoading || !filename) return
            setIsLoading(true)

            try {
                const result = await loadTrackData(filename)
                if (!result || cancelled) return

                setAllPoints(result.allPoints)
                setMinMaxKm(result.minMaxKm)
                setMaxTime(result.maxTime)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        })()

        return () => {
            cancelled = true
        }
    })

    return {
        allPoints,
        isLoading,
        minMaxKm,
        maxTime,
    }
}
