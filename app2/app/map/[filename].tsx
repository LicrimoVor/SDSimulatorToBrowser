import { Icon } from '@/components/icon'
import { Link } from '@/components/link'
import { ThemedText } from '@/components/text'
import { ThemedView } from '@/components/view'
import { LOCATION_TASK_TRACK_KM } from '@/core/tasks'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { buildStrokeTrack } from '@/libs/buildStrokeTrack'
import { Point, TrackKm } from '@/libs/buildTrackKm'
import { getLocationFromFile } from '@/libs/locations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFont } from '@shopify/react-native-skia'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, useColorScheme } from 'react-native'
import { Switch } from 'react-native-paper'
import { CartesianChart, Scatter } from 'victory-native'


const skFontAsset = require('@/assets/Abbieshire.ttf');

type AnyPoint = {
    lon: number
    latBase?: number
    latTrack?: number
    km: number
    trackTime?: number
}

export default function Map() {
    const { filename } = useLocalSearchParams()
    const [trackPoints, setTrackPoints] = useState<Point[]>([])
    const [basePoints, setBasePoints] = useState<Point[]>([])
    const [strokePoints, setStrokePoints] = useState<Point[]>([])
    const [allPoints, setAllPoints] = useState<AnyPoint[]>([])
    const [showScatter, setShowScatter] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [minMaxKm, setMinMaxKm] = useState<[number, number]>([0, 0])
    const [maxTime, setMaxTime] = useState(0)
    const colorSchema = useColorScheme() || 'light'
    const font = useFont(skFontAsset, 12);

    useInitialEffect(() => {
        ;(async () => {
            if (isLoading) return
            setIsLoading(true)
            const trackKm = await AsyncStorage.getItem(LOCATION_TASK_TRACK_KM)
            if (!trackKm) return

            const data = await getLocationFromFile(filename as string)
            const trackPoints = data.map<Point>((d) => ({
                lat: d.latitude,
                lon: d.longitude,
                km: d.km,
            }))
            setTrackPoints(trackPoints)

            const { points: basePoints } = JSON.parse(trackKm) as TrackKm
            setBasePoints(basePoints)

            const strokePoints = buildStrokeTrack(trackPoints, basePoints, 0.005)
            setStrokePoints(strokePoints)
            const time_start = data[0].timestamp
            // setMaxTime(time_start - data[data.length - 1].timestamp)
            setMaxTime(data.length)

            const minMaxKm = strokePoints.reduce(
                (acc, p) => [
                    Math.min(acc[0], p.km),
                    Math.max(acc[1], p.km),
                ],
                [data[0].km, data[0].km],
            )
            setMinMaxKm(minMaxKm as [number, number])

            const allPoints = [
                ...basePoints.map((p) => ({
                    lon: p.lon,
                    latBase: p.lat,
                    km: p.km,
                })),
                ...strokePoints.map((p, i) => ({
                    lon: p.lon,
                    latTrack: p.lat,
                    trackTime: time_start - data[i].timestamp + i,
                    km: p.km,
                })),
            ]
            console.log(allPoints.length)
            setAllPoints(allPoints)
            setIsLoading(false)
        })()
    })

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1 }}>
                <ActivityIndicator size={'large'} style={{ flex: 1 }} />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedView
                style={{
                    padding: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                }}
            >
                <Link
                    href="/(tabs)/location"
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    <Icon
                        name="arrow-left"
                        type="AntDesign"
                        size={28}
                        color={Colors[colorSchema]['text']}
                        style={{ marginRight: 10 }}
                    />
                </Link>
                <ThemedText style={{ fontSize: 20 }}>
                    Карта: {filename}
                </ThemedText>
                <Switch value={showScatter} onValueChange={setShowScatter} />
            </ThemedView>

            <ThemedView style={{ padding: 10, flex: 1 }}>
                <CartesianChart
                    domain={{
                        x: showScatter ? undefined : minMaxKm,
                        y: showScatter ? undefined : [0, maxTime]
                    }}
                    // domainPadding={{ left: 50, right: 50, bottom: 50 }}
                    domainPadding={0}
                    data={allPoints}
                    xKey={showScatter ? 'lon' : 'km'}
                    yKeys={showScatter ? ['latBase', 'latTrack'] : ['trackTime']}
                    axisOptions={{
                        lineColor: Colors[colorSchema]['text'],
                        formatXLabel: (km) => `${km} км`,
                        font,
                        labelColor: Colors[colorSchema]['text'],
                    }}
                >
                    {({ points }) =>
                        showScatter ? (
                            <>
                                <Scatter
                                    points={points.latBase}
                                    color="red"
                                    radius={1}
                                />

                                <Scatter
                                    points={points.latTrack}
                                    color="blue"
                                    radius={1}
                                />
                            </>
                        ) : (
                                <>
                                    <Scatter points={points.trackTime} color="blue" radius={1} />
                                </>
                        )
                    }
                </CartesianChart>
            </ThemedView>
        </ThemedView>
    )
}
