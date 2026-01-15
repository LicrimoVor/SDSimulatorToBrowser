import { Icon } from '@/components/icon'
import { Link } from '@/components/link'
import { ThemedText } from '@/components/text'
import { ThemedView } from '@/components/view'
import { Colors } from '@/core/theme'
import { useLoadTrackData } from '@/hooks/useLoadTrackData'
import { Circle, Text, useFont } from '@shopify/react-native-skia'
import { useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
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

export default function Map() {
    const { filename } = useLocalSearchParams()
    const [showScatter, setShowScatter] = useState(true)
    const { state: transformState } = useChartTransformState()
    const { state: pressState, isActive } = useChartPressState({
        x: 0,
        y: { latBase: 0, trackTime: 0, latTrack: 0 },
    })
    const colorSchema = useColorScheme() || 'light'
    const font = useFont(skFontAsset, 16)

    const { allPoints, isLoading, minMaxKm, maxTime } = useLoadTrackData(
        filename as string,
    )

    const pressedXText = useDerivedValue(() =>
        pressState.x.value.value.toFixed(2),
    )

    const domain: {
        x: [number, number] | undefined
        y: [number, number] | undefined
    } = useMemo(() => {
        if (showScatter)
            return {
                x: undefined,
                y: undefined,
            }
        return {
            x: minMaxKm,
            y: [0, maxTime],
        }
    }, [showScatter, minMaxKm, maxTime])

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
                    gap: 12,
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
                <ThemedText style={{ fontSize: 16 }}>
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
                            domain={domain}
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
