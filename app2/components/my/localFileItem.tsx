import { styles } from '@/constants/style'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

// ---------- Local file item ----------
export function LocalFileItem({ item, onRename, onDelete, onShare }: any) {
    return (
        <View style={styles.fileItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>{item.name}</Text>
                <Text
                    style={styles.fileMeta}
                >{`${item.size} • ${item.lastModified}`}</Text>
            </View>
            <View style={styles.fileActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onRename(item)}
                >
                    <Text style={styles.actionText}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onShare(item)}
                >
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#F87171' }]}
                    onPress={() => onDelete(item)}
                >
                    <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
