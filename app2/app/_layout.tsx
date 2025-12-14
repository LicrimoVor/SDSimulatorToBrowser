import { Header } from '@/components/ui/header'
import { Colors } from '@/constants/theme'
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
                    </Stack>
                </SafeAreaView>
            </SafeAreaProvider>
        </ThemeProvider>
    )
}
