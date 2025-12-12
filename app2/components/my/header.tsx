import { styles } from '@/constants/style'
import React from 'react'
import { StatusBar, Text, View } from 'react-native'

// Optional: better network detection
// import NetInfo from '@react-native-community/netinfo';

// ---------- Header ----------
export function Header({ isOnline }: { isOnline: boolean }) {
    return (
        <View style={styles.header}>
            <StatusBar
                barStyle={isOnline ? 'light-content' : 'dark-content'}
                backgroundColor={isOnline ? '#2563eb' : '#374151'}
            />
            <View style={styles.headerInner}>
                <View style={styles.statusDotWrap}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isOnline
                                    ? '#34D399'
                                    : '#EF4444',
                            },
                        ]}
                    />
                    <Text style={styles.statusText}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Text>
                </View>
                <Text style={styles.title}>My RN Files App</Text>
            </View>
        </View>
    )
}
