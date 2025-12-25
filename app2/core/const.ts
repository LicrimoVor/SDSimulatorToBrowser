import { Directory, Paths, File } from 'expo-file-system'

export const URL_API = __DEV__
    ? 'http://192.168.168.130:8000/api'
    : 'http://192.168.4.1:8000/api'

export const LOGS_DIR = new Directory(Paths.document, 'logs')
if (!LOGS_DIR.exists) {
    LOGS_DIR.create({ intermediates: true })
}

export const FILE_DIR = new Directory(Paths.document, 'data')
if (!FILE_DIR.exists) {
    FILE_DIR.create({ intermediates: true })
}
