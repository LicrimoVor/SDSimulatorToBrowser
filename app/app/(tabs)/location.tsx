import { ThemedText } from '@/components/text'
import { DeleteModal } from '@/components/ui/deleteModal'
import { LocationFileItem } from '@/components/ui/locationFileItem'
import { StatusCircle } from '@/components/ui/status'
import { ThemedView } from '@/components/view'
import { LOGS_DIR } from '@/core/const'
import { useGlobalContext } from '@/core/context'
import { LOCATION_TASK, LOCATION_TASK_FILENAME } from '@/core/tasks'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import { startLocationRecording, stopLocationRecording } from '@/libs/locations'
import { shareFile } from '@/libs/share'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Directory } from 'expo-file-system'
import { hasStartedLocationUpdatesAsync } from 'expo-location'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'

export default function LocalPage() {
    const { dirs, theme } = useGlobalContext()
    const { files, refresh: readFiles } = useLocalFiles()
    const [fileTarget, setFileTarget] = useState<LocalFile | null>(null)
    // const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isLocationStarted, setIsLocationStarted] = useState(false)
    const [writingFileName, setWritingFileName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    useInitialEffect(() => {
        setIsLoading(true)
        readFiles(new Directory(dirs[LOGS_DIR]))
        ;(async () => {
            setIsLocationStarted(
                await hasStartedLocationUpdatesAsync(LOCATION_TASK),
            )
            const fileName = await AsyncStorage.getItem(LOCATION_TASK_FILENAME)
            if (fileName) setWritingFileName(fileName)
            setIsLoading(false)
        })()
    })

    useEffect(() => {
        const id = setInterval(async () => {
            readFiles(new Directory(dirs[LOGS_DIR]))
            setIsLocationStarted(
                await hasStartedLocationUpdatesAsync(LOCATION_TASK),
            )
        }, 3_000)
        return () => clearInterval(id)
    }, [setIsLocationStarted, dirs, readFiles])

    const onClickHadler = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)
        if (await stopLocationRecording()) {
            console.log('end location')
            setIsLocationStarted(false)
            setWritingFileName('')
        } else {
            const nowDate = new Date()
            const fileName = `${nowDate.getFullYear()}.${nowDate.getMonth() + 1}.${nowDate.getDate()}.json`
            setWritingFileName(fileName)
            await startLocationRecording(fileName)
        }
        setIsLocationStarted(
            await hasStartedLocationUpdatesAsync(LOCATION_TASK),
        )
        setIsLoading(false)
    }, [setWritingFileName, setIsLocationStarted, isLoading, setIsLoading])

    const handleDelete = (item: LocalFile) => {
        setFileTarget(item)
        setDeleteModalVisible(true)
    }

    const handleShare = async (item: LocalFile) => {
        try {
            await shareFile(new Directory(dirs[LOGS_DIR]), item.file.name)
        } catch (e) {
            console.log(e)
            setIsError(true)
        }
    }

    return (
        <ThemedView style={{ flex: 1, paddingTop: 14 }}>
            <ThemedView
                style={{
                    alignItems: 'center',
                    padding: 4.25,
                }}
            >
                <ThemedText
                    style={{
                        fontWeight: '600',
                        fontSize: 18,
                    }}
                >
                    {isLocationStarted ? 'Трекер включен' : 'Трекер выключен'}
                </ThemedText>
            </ThemedView>

            <FlatList
                data={files}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                    <ThemedText style={{ textAlign: 'center' }}>
                        На МРМ нет сохраненных файлов.
                    </ThemedText>
                }
                renderItem={({ item }) => (
                    <LocationFileItem
                        item={item}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        isSelect={item.name === writingFileName}
                    />
                )}
            />
            <ThemedView
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 14,
                    borderTopWidth: 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <ThemedView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
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
                        {isLoading ? (
                            <>
                                <ActivityIndicator size={24} />
                                <ThemedText>Загрузка</ThemedText>
                            </>
                        ) : (
                            <>
                                <StatusCircle
                                    isActive={isLocationStarted}
                                    size={24}
                                />
                                <ThemedText>
                                    ({isLocationStarted ? 'вкл.' : 'выкл.'})
                                </ThemedText>
                            </>
                        )}
                    </ThemedView>
                </ThemedView>
                <TouchableOpacity
                    onPress={onClickHadler}
                    style={{
                        alignItems: 'center',
                        backgroundColor: Colors[theme]['sideback'],
                        padding: 14,
                        borderRadius: 8,
                    }}
                >
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 32 }}>
                        {isLocationStarted ? 'Закончить' : '   Начать   '}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
            <DeleteModal
                visible={isDeleteModalVisible}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setFileTarget(null)
                }}
                onDelete={() => {
                    setDeleteModalVisible(false)
                    if (!fileTarget || !fileTarget.file.exists) {
                        return
                    }
                    fileTarget.file.delete()
                    readFiles(new Directory(dirs[LOGS_DIR]))
                    setFileTarget(null)
                }}
            />
        </ThemedView>
    )
}
