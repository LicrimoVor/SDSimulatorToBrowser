import { Tabs } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native'

import { Icon } from '@/components/icon'
import { HapticTab } from '@/components/tabs'
import { Colors } from '@/constants/theme'

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
                    title: 'Трансмиттер',
                    tabBarIcon: ({ color }) => (
                        <Icon
                            type="FontAwesome5"
                            size={24}
                            name="wifi"
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="local"
                options={{
                    title: 'МРМ',
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
