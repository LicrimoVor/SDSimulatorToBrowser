import { Icon } from '@/components/icon'
import { ThemedText } from '@/components/text'
import { StatusCircle } from '@/components/ui/status'
import { ThemedView } from '@/components/view'
import { URL_API } from '@/constants/core'
import { Colors } from '@/constants/theme'
import { DATA_DIR } from '@/hooks/useLocalFiles'
import { File } from 'expo-file-system'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    BackHandler,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    useColorScheme
} from 'react-native'


export default function OnlineFilePage() {
    const [items, setItems] = useState<any[]>([])
    const [dirs, setDirs] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [isOnline, setIsOnline] = useState(false)
    const path = useMemo(() => dirs.join('/'), [dirs])
    const theme = useColorScheme() || 'light'

    const loadList = useCallback(async () => {
        setLoading(true)
        const query = encodeURIComponent(path)
        const url =
            dirs.length > 0
                ? `${URL_API}/list?path=${query}`
                : `${URL_API}/list`

        try {
            const res = await fetch(url)
            const json = await res.json()
            setItems(json)
            setIsOnline(true)
        } catch (e) {
            setIsOnline(false)
        } finally {
            setLoading(false)
        }
    }, [dirs, setIsOnline, setLoading, path])

    useEffect(() => {
        loadList()
    }, [path, loadList])

    const handleDownload = async (item: any) => {
        setLoading(true)
        const filePath = dirs.length > 0 ? path + '/' + item.name : item.name
        try {
            const url = `${URL_API}/file?path=${encodeURIComponent(filePath)}`
            const output = await File.downloadFileAsync(url, DATA_DIR)
                .then(() => setLoading(false))
                .catch(() => setLoading(false))
        } catch (e) {
            setLoading(false)
        }
    }

    const handleOpenDir = useCallback((item: any) => {
        setDirs(prev => [...prev, item.name])
    }, [])

    const handleBack = useCallback(() => {
        setDirs(prev => prev.slice(0, -1))
    }, [])

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (dirs.length > 0) {
                    handleBack()
                    return true
                }
                return false
            },
        )

        return () => subscription.remove()
    }, [handleBack, dirs])

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedView
                style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <ThemedView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <TouchableOpacity onPress={handleBack}>
                        <Icon
                            type="Ionicons"
                            size={24}
                            name={'arrow-back'}
                            color={Colors[theme]['tint']}
                        />
                    </TouchableOpacity>
                    <StatusCircle isActive={isOnline} />
                    <ThemedText style={{ fontWeight: '600' }}>
                        Статус: {loading ? 'Загрузка' : (isOnline ? 'Онлайн' : 'Оффлайн')}
                    </ThemedText>

                    <TouchableOpacity onPress={loadList} style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Icon
                            type="Ionicons"
                            size={24}
                            name={'refresh'}
                            color={Colors[theme]['tint']}
                        />
                    </TouchableOpacity>
                </ThemedView>
                <ThemedText style={{ color: '#6B7280', marginTop: 4 }}>
                    Путь: /{path}
                </ThemedText>
            </ThemedView>

            {items.length === 0 && !loading && (
                <ThemedView>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Пусто
                    </ThemedText>
                </ThemedView>
            )}

            {loading ? (
                <ThemedView>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Загрузка...
                    </ThemedText>
                </ThemedView>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, idx) => `${item.name}-${idx}`}
                    contentContainerStyle={{ padding: 12 }}
                    renderItem={({ item }) => (
                        <ThemedView style={styles.fileItem}>
                            <ThemedView>
                                {item.isDirectory ? (
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'folder'}
                                        color={Colors[theme]['icon']}
                                    />
                                ) : (
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'file'}
                                        color={Colors[theme]['icon']}
                                    />
                                )}
                            </ThemedView>
                            <ThemedView style={{ flex: 1 }}>
                                <ThemedText style={styles.fileName}>
                                    {item.name}
                                </ThemedText>
                                <ThemedText style={styles.fileMeta}>
                                    {item.isDirectory
                                        ? 'Directory'
                                        : `${item.size} bytes`}
                                </ThemedText>
                            </ThemedView>

                            {item.isDirectory ? (
                                <TouchableOpacity
                                    onPress={() => handleOpenDir(item)}
                                >
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'folder-open'}
                                        color={Colors[theme]['tint']}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => handleDownload(item)}
                                >
                                    <Icon
                                        type="Feather"
                                        size={24}
                                        name={'download'}
                                        color={Colors[theme]['tint']}
                                    />
                                </TouchableOpacity>
                            )}
                        </ThemedView>
                    )}
                />
            )}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    fileItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 6,
        borderRadius: 4,
        marginBottom: 10,
    },
    fileName: { fontWeight: '600', fontSize: 16 },
    fileMeta: { color: '#6B7280', marginTop: 4 },
    fileActions: { flexDirection: 'row', marginLeft: 12 },
})
