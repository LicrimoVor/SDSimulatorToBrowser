import { Colors } from '@/core/theme'
import { LocalFile } from '@/hooks/useLocalFiles'
import React from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native'
import { Icon } from '../icon'
import { ThemedText } from '../text'
import { ThemedView } from '../view'

type Props = {
    item: LocalFile
    isSelect?: boolean
    onRename: any
    onDelete: any
    onShare: any
}

function formatCustom(creationTime: number) {
    const date = new Date(creationTime)

    const pad = (n: number) => String(n).padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1) // getMonth() is 0-indexed
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// ---------- Local file item ----------
export function LocalFileItem({
    item,
    onRename,
    onDelete,
    onShare,
    isSelect = false,
}: Props) {
    const colorScheme = useColorScheme() ?? 'light'
    const time = item.file.creationTime || item.modified

    return (
        <ThemedView
            style={[
                styles.fileItem,
                isSelect && {
                    borderColor: Colors[colorScheme]['tint'],
                    borderWidth: 2,
                    padding: 10,
                },
                { backgroundColor: Colors[colorScheme]['sideback'] },
            ]}
        >
            <View style={{ flex: 1 }}>
                <ThemedText style={styles.fileName}>{item.name}</ThemedText>
                <Text
                    style={styles.fileMeta}
                >{`${item.size !== undefined ? item.size : '- - -'} bytes`}</Text>
                <Text style={styles.fileMeta}>
                    {time ? formatCustom(time) : '- - -'}
                </Text>
            </View>
            <View style={[styles.fileActions, { gap: 20 }]}>
                <TouchableOpacity onPress={() => onRename(item)}>
                    <Icon type="Entypo" size={28} name="edit" color="#A8E4A0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onShare(item)}>
                    <Icon
                        type="Entypo"
                        size={28}
                        name="share"
                        color="#77DDE7"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item)}>
                    <Icon
                        type="Entypo"
                        size={28}
                        name="trash"
                        color="#F87171"
                    />
                </TouchableOpacity>
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    fileItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    fileName: { fontWeight: '600', fontSize: 16 },
    fileMeta: { color: '#6B7280', marginTop: 4 },
    fileActions: { flexDirection: 'row', marginLeft: 12 },
})
