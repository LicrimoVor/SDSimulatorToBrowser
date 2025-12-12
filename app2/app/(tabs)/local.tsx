import React, { useMemo, useState } from 'react'
import { Alert, FlatList, Share, Text, View } from 'react-native'
import { LocalFileItem } from '../../components/my/localFileItem'
import { RenameModal } from '../../components/my/renameModal'

export default function LocalPage() {
    // Demo local files (in-memory). Replace with real FS calls.
    const initialFiles = useMemo(
        () => [
            {
                id: '1',
                name: 'report.pdf',
                size: '1.2 MB',
                lastModified: '2025-11-20',
            },
            {
                id: '2',
                name: 'photo.jpg',
                size: '640 KB',
                lastModified: '2025-11-18',
            },
            {
                id: '3',
                name: 'notes.txt',
                size: '3 KB',
                lastModified: '2025-11-01',
            },
        ],
        [],
    )

    const [files, setFiles] = useState(initialFiles)
    const [renameTarget, setRenameTarget] = useState(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)

    const handleRename = (item) => {
        setRenameTarget(item)
        setRenameModalVisible(true)
    }

    const handleDelete = (item) => {
        Alert.alert('Delete', `Delete "${item.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () =>
                    setFiles((prev) => prev.filter((f) => f.id !== item.id)),
            },
        ])
    }

    const handleShare = async (item) => {
        try {
            // If using real file path: Share.share({ url: 'file://' + item.path })
            await Share.share({ message: `Sharing file: ${item.name}` })
        } catch (e) {
            Alert.alert('Share error', e.message || String(e))
        }
    }

    const handleSaveRename = (newName) => {
        if (!newName || !renameTarget) return
        // minimal validation
        setFiles((prev) =>
            prev.map((f) =>
                f.id === renameTarget.id ? { ...f, name: newName } : f,
            ),
        )
        setRenameTarget(null)
        setRenameModalVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={files}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center' }}>No local files.</Text>
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
        </View>
    )
}
