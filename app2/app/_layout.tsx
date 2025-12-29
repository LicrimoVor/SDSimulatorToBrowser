import { initFileSystem } from '@/core/const'
import { LOCATION_TASK_TRACK_KM } from '@/core/tasks'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { buildTest } from '@/libs/buildTest'
import { buildTrackKm } from '@/libs/buildTrackKm'
import { requestLocationPermissions } from '@/libs/locations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, useColorScheme } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export const unstable_settings = {
    anchor: '(tabs)',
}

export default function RootLayout() {
    const [isLoading, setIsLoading] = useState(true)
    const colorScheme = useColorScheme() || 'light'
    useInitialEffect(() => {
        setIsLoading(true)
        ;(async () => {
            try {
                await initFileSystem()
                await requestLocationPermissions()
                await buildTest()
                const trackKm = await buildTrackKm()
                await AsyncStorage.setItem(
                    LOCATION_TASK_TRACK_KM,
                    JSON.stringify(trackKm),
                )
                console.log('Complete inited')
            } catch (e) {
                console.error(e)
            }
            setIsLoading(false)
        })()
    })

    if (isLoading) {
        return <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <SafeAreaProvider
                style={{ backgroundColor: Colors[colorScheme]['header'] }}
            >
                <StatusBar
                    style="auto"
                    translucent={false}
                    backgroundColor={Colors[colorScheme]['tint']}
                />
                <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
                    <ActivityIndicator size={'large'} style={{ flex: 1 }} />
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    }

    return (
        <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <SafeAreaProvider
                style={{ backgroundColor: Colors[colorScheme]['header'] }}
            >
                <StatusBar
                    style="auto"
                    translucent={false}
                    backgroundColor={Colors[colorScheme]['tint']}
                />
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* <Header /> */}
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="modal"
                            options={{ presentation: 'modal', title: 'Modal' }}
                        />
                        <Stack.Screen
                            name="map/[filename]"
                            options={{
                                title: 'Modal',
                                headerShown: false,
                                statusBarAnimation: 'slide',
                                statusBarHidden: true,
                                navigationBarHidden: true,
                            }}
                        />
                    </Stack>
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    )
}
