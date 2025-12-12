import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { backgroundColor: '#111827' },
    headerInner: { padding: 12 },
    statusDotWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusDot: { width: 10, height: 10, borderRadius: 6, marginRight: 8 },
    statusText: { color: '#D1D5DB', marginRight: 12 },
    title: { color: '#fff', fontSize: 18, fontWeight: '600' },
    body: { flex: 1, backgroundColor: '#fff' },
    footer: {
        height: 64,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabActive: { backgroundColor: '#EFF6FF' },
    tabText: { fontSize: 16 },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 10,
    },
    fileName: { fontWeight: '600' },
    fileMeta: { color: '#6B7280', marginTop: 4 },
    fileActions: { flexDirection: 'row', marginLeft: 12 },
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        marginLeft: 6,
    },
    actionText: { fontSize: 12 },

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
