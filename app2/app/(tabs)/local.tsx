import { ThemedText } from '@/components/text'
import { ThemedView } from '@/components/view'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { LocalFileItem } from '../../components/ui/localFileItem'
import { RenameModal } from '../../components/ui/renameModal'

export default function LocalPage() {
    const { files, loading, error, refresh: readFiles } = useLocalFiles()
    const [renameTarget, setRenameTarget] = useState<LocalFile | null>(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
        let a = setInterval(readFiles, 10_000)
        return () => clearInterval(a)
    }, [readFiles])

    const handleRename = (item: LocalFile) => {
        setRenameTarget(item)
        setRenameModalVisible(true)
    }

    const handleDelete = (item: LocalFile) => {
        item.file.delete()
        readFiles()
    }

    const handleShare = async (item: LocalFile) => {
        try {
            await Sharing.shareAsync(item.file.uri)
        } catch (_error) {
            setIsError(true)
        }
    }

    const handleSaveRename = (newName: string) => {
        if (!newName || !renameTarget) return
        try {
            renameTarget.file.rename(newName)
        } catch (error) {
            setIsError(true)
        }
        setRenameTarget(null)
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
                        Локальных файлов нет.
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
                item={renameTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setRenameTarget(null)
                }}
                onSave={handleSaveRename}
            />
        </ThemedView>
    )
}
