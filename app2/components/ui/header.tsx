import { Colors } from '@/constants/theme'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { ThemedText } from '../text'
import { ThemedView } from '../view'

export function Header() {
    const colorScheme = useColorScheme() ?? 'light'

    return (
        <ThemedView
            style={[
                styles.headerInner,
                { backgroundColor: Colors[colorScheme]['header'] },
            ]}
        >
            <Image
                source={require('@/assets/images/icon.png')}
                style={{ width: 40, height: 40 }}
            />
            <ThemedText style={[styles.title]}>BrowserReader</ThemedText>
        </ThemedView>
    )
}

export const styles = StyleSheet.create({
    headerInner: {
        padding: 4,
        gap: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: { marginRight: 12 },
    title: { fontSize: 18, fontWeight: '600' },
})
