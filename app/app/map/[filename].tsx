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
import { Circle, Text, useFont } from '@shopify/react-native-skia'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, useColorScheme } from 'react-native'
import { Switch } from 'react-native-paper'
import { SharedValue, useDerivedValue } from 'react-native-reanimated'
import {
    CartesianChart,
    Scatter,
    useChartPressState,
    useChartTransformState,
} from 'victory-native'

const skFontAsset = require('@/assets/Abbieshire.ttf')
function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
    return <Circle cx={x} cy={y} r={8} color="green" />
}

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
    const { state: transformState } = useChartTransformState()
    const { state: pressState, isActive } = useChartPressState({
        x: 0,
        y: { latBase: 0, trackTime: 0, latTrack: 0 },
    })
    const colorSchema = useColorScheme() || 'light'
    const font = useFont(skFontAsset, 16)

    useInitialEffect(() => {
        ;(async () => {
            if (isLoading) return
            setIsLoading(true)
            const trackKm = await AsyncStorage.getItem(LOCATION_TASK_TRACK_KM)
            if (!trackKm) return

            const data = await getLocationFromFile(filename as string)
            if (data.length === 0) {
                setIsLoading(false)
                return
            }

            const trackPoints = data.map<Point>((d) => ({
                lat: d.latitude,
                lon: d.longitude,
                km: d.km,
            }))
            setTrackPoints(trackPoints)

            const { points: basePoints } = JSON.parse(trackKm) as TrackKm
            setBasePoints(basePoints)

            const strokePoints = buildStrokeTrack(
                trackPoints,
                basePoints,
                0.005,
            )
            setStrokePoints(strokePoints)
            const time_start = data[0].timestamp
            // setMaxTime(time_start - data[data.length - 1].timestamp)
            setMaxTime(data.length)

            const minMaxKm = strokePoints.reduce(
                (acc, p) => [Math.min(acc[0], p.km), Math.max(acc[1], p.km)],
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

    const pressedXText = useDerivedValue(() => {
        return String(pressState.x.value.value)
    })

    if (isLoading) {
        return (
            <ThemedView
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator size={64} style={{ flex: 1 }} />
                <ThemedText>Загрузка...</ThemedText>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedView
                style={{
                    padding: 8,
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
                <ThemedView
                    style={{
                        marginLeft: 'auto',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Icon
                        name="line-chart"
                        type="AntDesign"
                        size={24}
                        color={Colors[colorSchema]['text']}
                    />
                    <Switch
                        value={showScatter}
                        onValueChange={setShowScatter}
                    />
                    <Icon
                        name="map"
                        type="FontAwesome5"
                        size={24}
                        color={Colors[colorSchema]['text']}
                    />
                </ThemedView>
            </ThemedView>

            {allPoints.length > 0 ? (
                <ThemedView style={{ flex: 1, padding: 4 }}>
                    <ThemedText>{showScatter ? 'Широта' : 'Время'}</ThemedText>
                    <ThemedView style={{ flex: 1 }}>
                        <CartesianChart
                            domain={{
                                x: showScatter ? undefined : minMaxKm,
                                y: showScatter ? undefined : [0, maxTime],
                            }}
                            transformState={
                                !showScatter ? undefined : transformState
                            }
                            chartPressState={
                                !showScatter ? pressState : undefined
                            }
                            domainPadding={{
                                left: 12,
                                right: 24,
                                top: 8,
                                bottom: 0,
                            }}
                            data={allPoints}
                            xKey={showScatter ? 'lon' : 'km'}
                            yKeys={
                                showScatter
                                    ? ['latBase', 'latTrack']
                                    : ['trackTime']
                            }
                            axisOptions={{
                                lineColor: Colors[colorSchema]['text'],
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
                                        <Scatter
                                            points={points.trackTime}
                                            color="blue"
                                            radius={1}
                                        />

                                        {isActive ? (
                                            <Text
                                                x={pressState.x.position}
                                                y={
                                                    pressState.y.trackTime
                                                        .position
                                                }
                                                font={font}
                                                text={pressedXText}
                                                color="red"
                                            />
                                        ) : null}
                                    </>
                                )
                            }
                        </CartesianChart>
                        <ThemedText
                            style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        >
                            {showScatter ? 'Долгота' : 'Координата'}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            ) : (
                <ThemedView
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ThemedText>Нет данных</ThemedText>
                </ThemedView>
            )}
        </ThemedView>
    )
}
