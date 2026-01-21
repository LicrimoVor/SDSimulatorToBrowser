import { Directory, Paths } from 'expo-file-system'
import Constants from "expo-constants";

export const AES_KEY_HEX = process.env.EXPO_PUBLIC_AES_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_AES_KEY;
export const AES_IV_HEX = process.env.EXPO_PUBLIC_AES_IV || Constants.expoConfig?.extra?.EXPO_PUBLIC_AES_IV;
export const URL_API = __DEV__
    ? 'http://192.168.1.45:8000/api'
    : 'http://192.168.4.1:8000/api'
export const LOGS_DIR = 'logs'
export const FILE_DIR = 'data'
export const DEFAULT_ROOT_DIR = Paths.document.uri
export const KEY_ROOT_DIR = 'ROOT_DIR'
export const KEY_DIRS = 'DIRS'
export type ALL_DIRS = Record<string, string>

export async function initFileSystem(root_dir: string) {
    const dirs = [LOGS_DIR, FILE_DIR]
    const root = new Directory(root_dir)
    const info = root.info()
    let all_dirs: ALL_DIRS = {}
    all_dirs['root'] = root.uri

    for (const dir of dirs) {
        if (root_dir === DEFAULT_ROOT_DIR) {
            try {
                const dir2 = new Directory(root_dir + dir)
                all_dirs[dir] = root_dir + dir
                dir2.create()
            } catch {
                console.log('exists')
            }
        } else if (info.files && !info.files.includes(dir)) {
            all_dirs[dir] = root.createDirectory(dir).uri
            console.log(`Creating ${dir}`)
        } else {
            root.listAsRecords().forEach(({ uri, isDirectory }) => {
                if (uri.slice(0, -1).endsWith(dir) && Boolean(isDirectory)) {
                    all_dirs[dir] = uri
                }
            })
        }
    }

    return all_dirs
}
