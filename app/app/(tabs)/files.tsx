import { Icon } from '@/components/icon'
import { ThemedText } from '@/components/text'
import { DeleteModal } from '@/components/ui/deleteModal'
import { ThemedView } from '@/components/view'
import {
    DEFAULT_ROOT_DIR,
    FILE_DIR,
    initFileSystem,
    KEY_DIRS,
    KEY_ROOT_DIR,
} from '@/core/const'
import { useGlobalContext } from '@/core/context'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import { renameFile } from '@/libs/renameFile'
import { shareFile } from '@/libs/share'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Directory } from 'expo-file-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { LocalFileItem } from '../../components/ui/localFileItem'
import { RenameModal } from '../../components/ui/renameModal'

const formatDir = (dirs: string) => {
    let dir = dirs.split('tree/')[1]
    if (dir.length > 10) {
        return dir.slice(0, 10) + '.../'
    }
    return dir
}

export default function FilesPage() {
    const context = useGlobalContext()
    const { dirs, theme, change } = context
    const { files, refresh: readFiles } = useLocalFiles()
    const [fileTarget, setFileTarget] = useState<LocalFile | null>(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isError, setIsError] = useState(false)
    const fileDir = useMemo(() => new Directory(dirs[FILE_DIR]), [dirs])

    useInitialEffect(() => readFiles(fileDir))
    useEffect(() => {
        let a = setInterval(() => readFiles(fileDir), 10_000)
        return () => clearInterval(a)
    }, [readFiles, fileDir])

    const handleSaveRename = async (newName: string) => {
        if (!newName || !fileTarget) return
        setRenameModalVisible(false)
        setFileTarget(null)
        try {
            await renameFile(fileDir, fileTarget.file, newName)
        } catch {
            setIsError(true)
        }
        readFiles(fileDir)
    }

    const onSetDirectory = useCallback(async () => {
        try {
            const { uri } = await Directory.pickDirectoryAsync()
            const new_dirs = await initFileSystem(uri)
            change({ ...context, dirs: new_dirs })
            await AsyncStorage.multiSet([
                [KEY_ROOT_DIR, uri],
                [KEY_DIRS, JSON.stringify(new_dirs)],
            ])
            setTimeout(() => readFiles(new Directory(new_dirs[FILE_DIR])), 100)
        } catch (e) {
            console.log(e)
        }
    }, [change, context, readFiles])

    const onRefreshDirectory = useCallback(async () => {
        try {
            const new_dirs = await initFileSystem(DEFAULT_ROOT_DIR)
            change({ ...context, dirs: new_dirs })
            await AsyncStorage.multiSet([
                [KEY_ROOT_DIR, DEFAULT_ROOT_DIR],
                [KEY_DIRS, JSON.stringify(new_dirs)],
            ])
            setTimeout(() => readFiles(new Directory(new_dirs[FILE_DIR])), 100)
        } catch (e) {
            console.log(e)
        }
    }, [change, context, readFiles])

    const renderItem = useCallback(
        ({ item }: { item: LocalFile }) => (
            <LocalFileItem
                item={item}
                onRename={(item: LocalFile) => {
                    setFileTarget(item)
                    setRenameModalVisible(true)
                }}
                onDelete={(item: LocalFile) => {
                    setFileTarget(item)
                    setDeleteModalVisible(true)
                }}
                onShare={async (item: LocalFile) => {
                    try {
                        await shareFile(fileDir, item.file.name)
                    } catch (e) {
                        console.log(e)
                        setIsError(true)
                    }
                }}
            />
        ),
        [
            setFileTarget,
            setRenameModalVisible,
            setDeleteModalVisible,
            setIsError,
            fileDir,
        ],
    )

    return (
        <ThemedView style={{ flex: 1, paddingTop: 14 }}>
            <ThemedView
                style={{
                    flexDirection: 'row',
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <TouchableOpacity onPress={onRefreshDirectory}>
                    <Icon
                        type="MaterialCommunityIcons"
                        size={32}
                        name={'folder-refresh-outline'}
                        color={Colors[theme]['tint']}
                    />
                    {/*  */}
                </TouchableOpacity>
                <ThemedText
                    style={{
                        marginLeft: 'auto',
                        fontWeight: '600',
                        fontSize: 18,
                    }}
                >
                    {dirs['root'] === DEFAULT_ROOT_DIR
                        ? 'BrowserReader/' + FILE_DIR
                        : 'Внутренняя/' + FILE_DIR}
                </ThemedText>
                <TouchableOpacity
                    onPress={onSetDirectory}
                    style={{ marginLeft: 'auto' }}
                >
                    <Icon
                        type="MaterialCommunityIcons"
                        size={32}
                        name={'folder-edit-outline'}
                        color={Colors[theme]['tint']}
                    />
                    {/* folder-refresh-outline */}
                </TouchableOpacity>
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
                renderItem={renderItem}
            />
            <RenameModal
                visible={isRenameModalVisible}
                item={fileTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setFileTarget(null)
                    readFiles(fileDir)
                }}
                onSave={handleSaveRename}
            />
            <DeleteModal
                visible={isDeleteModalVisible}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setFileTarget(null)
                }}
                onDelete={() => {
                    setDeleteModalVisible(false)
                    if (!fileTarget) {
                        return
                    }
                    fileTarget.file.delete()
                    readFiles(fileDir)
                    setFileTarget(null)
                }}
            />
        </ThemedView>
    )
}
