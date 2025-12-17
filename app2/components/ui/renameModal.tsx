import { Colors } from '@/constants/theme'
import React, { useEffect, useState } from 'react'
import {
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme
} from 'react-native'
import { ThemedText } from '../text'
import { ThemedView } from '../view'

export function RenameModal({ visible, item, onCancel, onSave }: any) {
    const [value, setValue] = useState(item ? item.name : '')
    const theme = useColorScheme() || 'light'

    useEffect(() => {
        setValue(item ? item.name : '')
    }, [item])

    return (
        <Modal visible={visible} transparent animationType="fade">
            <ThemedView style={styles.modalOverlay}>
                <ThemedView style={styles.modalBox}>
                    <ThemedText style={styles.modalTitle}>Переимновать файл</ThemedText>
                    <TextInput
                        style={[styles.input, { color: Colors[theme]['text'] }]}
                        value={value}
                        onChangeText={setValue}
                        placeholder="Новое имя файла"
                        autoFocus
                    />
                    <ThemedView style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={onCancel}
                        >
                            <ThemedText>Отменить</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.modalSave]}
                            onPress={() => onSave(value)}
                        >
                            <ThemedText style={{ color: '#fff' }}>Сохранить</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Modal>
    )
}

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalBox: { borderRadius: 8, padding: 16 },
    modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 8,
        borderRadius: 6,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    modalBtn: { padding: 8, marginLeft: 8 },
    modalSave: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 12,
        borderRadius: 6,
    },
})
