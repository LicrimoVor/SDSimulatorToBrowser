import React, { useEffect, useState } from 'react'
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

export function RenameModal({ visible, item, onCancel, onSave }: any) {
    const [value, setValue] = useState(item ? item.name : '')

    useEffect(() => {
        setValue(item ? item.name : '')
    }, [item])

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Переимновать файл</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder="Новое имя файла"
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={onCancel}
                        >
                            <Text>Отменить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.modalSave]}
                            onPress={() => onSave(value)}
                        >
                            <Text style={{ color: '#fff' }}>Сохранить</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalBox: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
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
