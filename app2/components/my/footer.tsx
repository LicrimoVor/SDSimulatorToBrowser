import { styles } from '@/constants/style'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
// ---------- Footer (tab navigation) ----------
export function Footer({ page, setPage }: any) {
    return (
        <View style={styles.footer}>
            <TouchableOpacity
                style={[styles.tab, page === 'online' && styles.tabActive]}
                onPress={() => setPage('online')}
            >
                <Text style={styles.tabText}>Online</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, page === 'local' && styles.tabActive]}
                onPress={() => setPage('local')}
            >
                <Text style={styles.tabText}>Local</Text>
            </TouchableOpacity>
        </View>
    )
}
