import { Tabs } from 'expo-router'
import React from 'react'

import { HapticTab } from '@/components/haptic-tab'
import { Icon } from '@/components/ui/icon'
import { Colors } from '@/constants/theme'
import { useColorScheme } from 'react-native'

export default function TabLayout() {
    const colorScheme = useColorScheme()

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Онлайн',
                    tabBarIcon: ({ color }) => (
                        <Icon
                            type="Entypo"
                            size={28}
                            name="network"
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="local"
                options={{
                    title: 'Локально',
                    tabBarIcon: ({ color }) => (
                        <Icon
                            type="AntDesign"
                            size={28}
                            name="file-text"
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}
