import { Icon } from '@/components/icon'
import { ThemedText } from '@/components/text'
import { StatusCircle } from '@/components/ui/status'
import { ThemedView } from '@/components/view'
import { FILE_DIR, URL_API } from '@/core/const'
import { useGlobalContext } from '@/core/context'
import { Colors } from '@/core/theme'
import { getOrCreateFile } from '@/libs/createFile'
import { parseBytes } from '@/libs/parseBytes'
import { Directory, File, Paths } from 'expo-file-system'
import { createDownloadResumable } from 'expo-file-system/legacy'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import { ProgressBar } from 'react-native-paper'

type FileLoader = {
    name: string
    progress: number
    error?: boolean
}

export default function OnlineFilePage() {
    const { dirs, theme } = useGlobalContext()
    const [items, setItems] = useState<any[]>([])
    const [history, setHistory] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [progresses, setProgress] = useState<Record<string, FileLoader>>({})
    const [isOnline, setIsOnline] = useState(false)
    const [error, setError] = useState<any>(null)
    const path = useMemo(() => history.join('/'), [history])

    const loadList = useCallback(async () => {
        setLoading(true)
        const query = encodeURIComponent(path)
        const url =
            history.length > 0
                ? `${URL_API}/list?path=/${query}`
                : `${URL_API}/list`

        try {
            const res = await fetch(url)
            const json = await res.json()
            setItems(json)
            setIsOnline(true)
        } catch {
            setIsOnline(false)
        } finally {
            setLoading(false)
        }
    }, [history, setIsOnline, setLoading, path])

    useEffect(() => {
        loadList()
    }, [path, loadList])

    const handleDownload = async (item: any) => {
        setLoading(true)
        setError(false)
        const filePath = history.length > 0 ? path + '/' + item.name : item.name
        try {
            const url = `${URL_API}/file?path=/${encodeURIComponent(filePath)}`
            const res = await createDownloadResumable(
                url,
                Paths.cache.uri + '/' + item.name,
                {},
                ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                    if (totalBytesExpectedToWrite > 0) {
                        const percent =
                            totalBytesWritten / totalBytesExpectedToWrite
                        setProgress((prev) => ({
                            ...prev,
                            [item.name]: {
                                name: item.name,
                                progress: percent,
                            },
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

            let name = item.name
            try {
                if (item.name.endsWith('.rdm')) {
                    const { dd, mm, left_rigth, km_start, id } =
                        parseBytes(bytes)
                    name = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}_${left_rigth}_${km_start}-${km_start}_${id}.rdm`
                }
            } catch {
                name = item.name
                setError(true)
            }

            const dir = new Directory(dirs[FILE_DIR])
            const info = dir.info()
            if (info.files && info.files.includes(name)) {
                throw Error('File already exists')
            } else {
                const all_bytes = await file.bytes()
                const new_file = await getOrCreateFile(dir, name)
                new_file.write(all_bytes)
                console.log('file renamed success', all_bytes.length)
            }
        } catch (e) {
            console.log(e)
            setProgress((prev) => ({
                ...prev,
                [item.name]: {
                    name: item.name,
                    progress: 1,
                    error: true,
                },
            }))
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDir = useCallback((item: any) => {
        setHistory((prev) => [...prev, item.name])
    }, [])

    const handleBack = useCallback(() => {
        setHistory((prev) => prev.slice(0, -1))
    }, [])

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (history.length > 0) {
                    handleBack()
                    return true
                }
                return false
            },
        )

        return () => subscription.remove()
    }, [handleBack, history])

    const onRefresh = () => {
        loadList()
        setProgress({})
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedView
                style={{
                    padding: 14,
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
                    <TouchableOpacity
                        onPress={handleBack}
                        disabled={history.length === 0}
                    >
                        <Icon
                            type="Ionicons"
                            size={32}
                            name={'arrow-back'}
                            color={Colors[theme]['tint']}
                            style={{ opacity: history.length === 0 ? 0.25 : 1 }}
                        />
                    </TouchableOpacity>
                    <ThemedText
                        style={{
                            fontWeight: 'bold',
                            fontSize: 18,
                            paddingRight: 16,
                        }}
                    >
                        Статус:
                    </ThemedText>
                    <ThemedView style={{ alignItems: 'center' }}>
                        {!loading ? (
                            <StatusCircle isActive={isOnline} size={24} />
                        ) : (
                            <ActivityIndicator size={24} />
                        )}

                        <ThemedText>
                            (
                            {loading
                                ? 'загрузка'
                                : isOnline
                                  ? 'подключено'
                                  : 'отключено'}
                            )
                        </ThemedText>
                    </ThemedView>

                    <TouchableOpacity
                        onPress={onRefresh}
                        style={{ flex: 1, alignItems: 'flex-end' }}
                    >
                        <Icon
                            type="Ionicons"
                            size={32}
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
                        <ThemedView key={name} style={{ gap: 12 }}>
                            <ThemedText>{name}</ThemedText>
                            <ProgressBar
                                progress={progresses[name].progress}
                                color={
                                    progresses[name].error ? 'red' : undefined
                                }
                            />
                        </ThemedView>
                    ))}
                </ThemedView>
            )}

            {items.length === 0 && !loading && (
                <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Нет подключения
                    </ThemedText>
                </ThemedView>
            )}

            {loading ? (
                <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size={64} />
                    <ThemedText style={{ textAlign: 'center' }}>
                        Загрузка...
                    </ThemedText>
                </ThemedView>
            ) : (
                items.length > 0 && (
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
                )
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
