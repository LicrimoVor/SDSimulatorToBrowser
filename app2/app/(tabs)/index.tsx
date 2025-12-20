import { Icon } from '@/components/icon'
import { ThemedText } from '@/components/text'
import { StatusCircle } from '@/components/ui/status'
import { ThemedView } from '@/components/view'
import { URL_API } from '@/constants/core'
import { Colors } from '@/constants/theme'
import { DATA_DIR } from '@/hooks/useLocalFiles'
import { parseBytes } from '@/libs/parse_bytes'
import { File } from 'expo-file-system'
import { createDownloadResumable } from 'expo-file-system/legacy'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    BackHandler,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
} from 'react-native'
import { ProgressBar } from 'react-native-paper'


export default function OnlineFilePage() {
    const [items, setItems] = useState<any[]>([])
    const [dirs, setDirs] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [progresses, setProgress] = useState<Record<string, number>>({})
    const [isOnline, setIsOnline] = useState(false)
    const [error, setError] = useState<any>(null)
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
        setError(false)
        const filePath = dirs.length > 0 ? path + '/' + item.name : item.name
        try {
            const url = `${URL_API}/file?path=${encodeURIComponent(filePath)}`
            const a = DATA_DIR.uri + item.name
            const res = await createDownloadResumable(
                url,
                a,
                {},
                ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                    if (totalBytesExpectedToWrite > 0) {
                        const percent =
                            totalBytesWritten / totalBytesExpectedToWrite
                        setProgress((prev) => ({
                            ...prev,
                            [item.name]: percent,
                        }))
                    }
                },
            ).downloadAsync()
            if (!res) {
                setError(false)
                return
            }

            const file = new File(res.uri)
            const oFile = await file.open()
            const bytes = oFile.readBytes(160)
            oFile.close()
            parseBytes(bytes)

        } catch (e) { 
            setError(true)
        }
        finally {
            setLoading(false)
        }
    }

    const handleOpenDir = useCallback((item: any) => {
        setDirs((prev) => [...prev, item.name])
    }, [])

    const handleBack = useCallback(() => {
        setDirs((prev) => prev.slice(0, -1))
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

    const onRefresh = () => {
        loadList()
        setProgress({})
    }

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
                        Статус:{' '}
                        {error ? 'Ошибка' : loading ? 'Загрузка' : isOnline ? 'Подключено' : 'Отключено'}
                    </ThemedText>

                    <TouchableOpacity
                        onPress={onRefresh}
                        style={{ flex: 1, alignItems: 'flex-end' }}
                    >
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
            {Object.keys(progresses).length > 0 && (
                <ThemedView
                    style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderColor: '#E5E7EB',
                    }}
                >
                    {Object.keys(progresses).map((name) => (
                        <ThemedView
                            key={name}
                            style={{ gap: 12 }}
                        >
                            <ThemedText>{name}</ThemedText>
                            <ProgressBar
                                progress={progresses[name]}
                            />
                        </ThemedView>
                    ))}
                </ThemedView>
            )}

            {items.length === 0 && !loading && (
                <ThemedView>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Нет подключения
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
                                        ? 'Папка'
                                        : `${item.size}`}
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
