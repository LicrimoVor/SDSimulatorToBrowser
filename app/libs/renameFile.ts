import { DEFAULT_ROOT_DIR } from '@/core/const'
import { Directory, File } from 'expo-file-system'
import { getOrCreateFile } from './createFile'

export const renameFile = async (
    dir: Directory,
    file: File,
    newName: string,
) => {
    console.log('renaming file')
    const root = dir.parentDirectory.uri
    const info = dir.info().files
    if (info && info.includes(newName)) return file

    if (root === DEFAULT_ROOT_DIR || file.uri.startsWith(DEFAULT_ROOT_DIR)) {
        file.rename(newName)
        return file
    } else {
        try {
            const new_file = await getOrCreateFile(dir, newName)
            const all_bytes = await file.bytes()
            new_file.write(all_bytes)
            file.delete()
            return new_file
        } catch (e) {
            console.log(e)
            return file
        }
    }
}
