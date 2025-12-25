import { ThemedText } from '@/components/text'
import { DeleteModal } from '@/components/ui/deleteModal'
import { ThemedView } from '@/components/view'
import { FILE_DIR } from '@/core/const'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { LocalFileItem } from '../../components/ui/localFileItem'
import { RenameModal } from '../../components/ui/renameModal'

export default function FilesPage() {
    const { files, refresh: readFiles } = useLocalFiles(FILE_DIR)
    const [fileTarget, setFileTarget] = useState<LocalFile | null>(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
        let a = setInterval(readFiles, 10_000)
        return () => clearInterval(a)
    }, [readFiles])

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
            await Sharing.shareAsync(item.file.uri)
        } catch (_error) {
            setIsError(true)
        }
    }

    const handleSaveRename = (newName: string) => {
        if (!newName || !fileTarget) return
        try {
            fileTarget.file.rename(newName)
        } catch (error) {
            setIsError(true)
        }
        setFileTarget(null)
        setRenameModalVisible(false)
        readFiles()
    }

    return (
        <ThemedView style={{ flex: 1, paddingTop: 14 }}>
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
                    readFiles()
                    setFileTarget(null)
                }}
            />
        </ThemedView>
    )
}
