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
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { LocalFileItem } from '../../components/ui/localFileItem'
import { RenameModal } from '../../components/ui/renameModal'

const formatDir = (dir: string) => {
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

    useInitialEffect(() => readFiles(new Directory(dirs[FILE_DIR])))
    useEffect(() => {
        let a = setInterval(
            () => readFiles(new Directory(dirs[FILE_DIR])),
            2_500,
        )
        return () => clearInterval(a)
    }, [readFiles, dirs])

    const handleRename = (item: LocalFile) => {
        setFileTarget(item)
        setRenameModalVisible(true)
    }

    const handleDelete = (item: LocalFile) => {
        setFileTarget(item)
        setDeleteModalVisible(true)
    }

    const handleShare = async (item: LocalFile) => {
        try {
            await shareFile(new Directory(dirs[FILE_DIR]), item.file.name)
        } catch (e) {
            console.log(e)
            setIsError(true)
        }
    }

    const handleSaveRename = async (newName: string) => {
        if (!newName || !fileTarget) return
        setRenameModalVisible(false)
        setFileTarget(null)
        try {
            await renameFile(
                new Directory(dirs[FILE_DIR]),
                fileTarget.file,
                newName,
            )
        } catch {
            setIsError(true)
        }
        readFiles(new Directory(dirs[FILE_DIR]))
    }

    const onSetDirectory = useCallback(async () => {
        try {
            const { uri } = await Directory.pickDirectoryAsync()
            const new_dirs = await initFileSystem(uri)
            change({ ...context, dirs: new_dirs })
            await AsyncStorage.setItem(KEY_ROOT_DIR, uri)
            await AsyncStorage.setItem(KEY_DIRS, JSON.stringify(new_dirs))
            readFiles(new Directory(new_dirs[FILE_DIR]))
        } catch (e) {
            console.log(e)
        }
    }, [change, context, readFiles])

    const onRefreshDirectory = useCallback(async () => {
        try {
            const new_dirs = await initFileSystem(DEFAULT_ROOT_DIR)
            change({ ...context, dirs: new_dirs })
            await AsyncStorage.setItem(KEY_ROOT_DIR, DEFAULT_ROOT_DIR)
            await AsyncStorage.setItem(KEY_DIRS, JSON.stringify(new_dirs))
            readFiles(new Directory(new_dirs[FILE_DIR]))
        } catch (e) {
            console.log(e)
        }
    }, [change, context, readFiles])

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
                        : formatDir(dirs['root'].split('tree/')[1]) + FILE_DIR}
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
                renderItem={({ item }) => (
                    <LocalFileItem
                        item={item}
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onShare={handleShare}
                    />
                )}
            />
            <RenameModal
                visible={isRenameModalVisible}
                item={fileTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setFileTarget(null)
                    readFiles(new Directory(dirs[FILE_DIR]))
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
                    readFiles(new Directory(dirs[FILE_DIR]))
                    setFileTarget(null)
                }}
            />
        </ThemedView>
    )
}
