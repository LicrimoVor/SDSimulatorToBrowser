import { LOGS_DIR } from '@/core/const'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'

export async function buildTest() {
    console.log('build test')
    const [{ localUri }] = await Asset.loadAsync(
        require('@/assets/data/test2.csv'),
    )
    if (!localUri) return

    const content = await new File(localUri).text().then((text) => text.trim())
    const file = new File(LOGS_DIR.uri + 'test.json')
    if (file.exists) return
    file.write(content)
    file.create({ intermediates: true })

    console.log('build test complete')
}
