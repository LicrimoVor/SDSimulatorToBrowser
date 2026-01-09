import { DEFAULT_ROOT_DIR, KEY_DIRS, LOGS_DIR } from '@/core/const'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Asset } from 'expo-asset'
import { Directory, File } from 'expo-file-system'
import { getOrCreateFile } from './createFile'

export async function buildTest() {
    console.log('build test start')
    const [{ localUri }] = await Asset.loadAsync(
        require('@/assets/data/test2.csv'),
    )
    if (!localUri) return
    const content = await new File(localUri).text().then((text) => text.trim())

    const dirs = await AsyncStorage.getItem(KEY_DIRS)
    const dirs_parsed = dirs && JSON.parse(dirs)
    const dir = dirs
        ? dirs_parsed[LOGS_DIR]
        : `${DEFAULT_ROOT_DIR}/${LOGS_DIR}/`

    const dir_log = new Directory(dir)
    const info = dir_log.info()
    if (!info.exists) {
        console.log('build root exists')
        return
    }

    if (info.files && info.files.includes('test.json')) {
        console.log('build test exists')
        return
    }

    const file = await getOrCreateFile(dir_log, 'test.json')
    file.write(content)
    console.log('build test complete')
}
