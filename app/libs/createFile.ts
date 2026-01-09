import { DEFAULT_ROOT_DIR } from '@/core/const'
import { Directory, File } from 'expo-file-system'

export const getOrCreateFile = async (dir: Directory, fileName: string) => {
    let file: File
    if (
        dir.parentDirectory.uri === DEFAULT_ROOT_DIR ||
        dir.uri.startsWith(DEFAULT_ROOT_DIR)
    ) {
        file = new File(dir.uri + fileName)
        try {
            file.create()
        } catch (e) {
            console.log(e)
        }
    } else {
        const info = dir.info()
        if (info.files && !info.files.includes(fileName)) {
            let mimetype = 'application/octet-stream'
            if (fileName.endsWith('.json')) {
                mimetype = 'application/json'
            }
            try {
                file = dir.createFile(fileName, mimetype)
            } catch (e) {
                console.log(e)
                file = dir
                    .list()
                    .find(
                        (file) =>
                            file.uri.slice(0, -1).endsWith(fileName) ||
                            file.uri.endsWith(fileName),
                    ) as File
            }
        } else {
            file = dir
                .list()
                .find(
                    (file) =>
                         decodeURIComponent(file.uri).slice(0, -1).endsWith(fileName) ||
                         decodeURIComponent(file.uri).endsWith(fileName),
                ) as File
        }
    }
    return file
}
