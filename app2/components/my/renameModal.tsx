import { styles } from '@/constants/style'
import React, { useEffect, useState } from 'react'
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ---------- Rename modal ----------
export function RenameModal({ visible, item, onCancel, onSave }: any) {
    const [value, setValue] = useState(item ? item.name : '')

    useEffect(() => {
        setValue(item ? item.name : '')
    }, [item])

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Rename file</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder="New filename"
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={onCancel}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.modalSave]}
                            onPress={() => onSave(value)}
                        >
                            <Text style={{ color: '#fff' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
