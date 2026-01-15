import { Directory, Paths, File } from 'expo-file-system'
import { getOrCreateFile } from './createFile'
import { DEFAULT_ROOT_DIR } from '@/core/const'
import * as Sharing from 'expo-sharing'

export const shareFile = async (dir: Directory, file_name: string) => {
    const file = await getOrCreateFile(dir, file_name)

    if (
        dir.parentDirectory.uri === DEFAULT_ROOT_DIR ||
        file.uri.startsWith(DEFAULT_ROOT_DIR)
    ) {
        await Sharing.shareAsync(file.uri)
    } else {
        console.log('copying file')
        const all_bytes = await file.bytes()
        const new_file = new File(Paths.document.uri + file_name)
        new_file.write(all_bytes)

        await Sharing.shareAsync(new_file.uri)
    }
}
