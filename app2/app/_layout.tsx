import { Header } from '@/components/ui/header'
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
import { useColorScheme } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export const unstable_settings = {
    anchor: '(tabs)',
}

export default function RootLayout() {
    const colorScheme = useColorScheme() || 'light'
    useInitialEffect(() => {
        ;(async () => {
            try {
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
        })()
    })

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
                    <Header />
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
                            }}
                        />
                    </Stack>
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    )
}
