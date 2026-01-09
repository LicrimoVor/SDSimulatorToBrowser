import * as TaskManager from 'expo-task-manager'
import { Directory, File } from 'expo-file-system'
import { KEY_DIRS, KEY_ROOT_DIR, LOGS_DIR } from '@/core/const'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { coord2km } from '@/libs/coord2km'
import { getOrCreateFile } from '@/libs/createFile'

export const LOCATION_TASK = 'background-location-task'
export const LOCATION_TASK_FILENAME = 'LOCATION_TASK_FILENAME'
export const LOCATION_TASK_TRACK_KM = 'LOCATION_TASK_POINTS'
export const LOCATION_TASK_LAST_KM = 'LOCATION_TASK_LAST_KM'

export interface LocationRecord {
    timestamp: number
    time_OS: number
    latitude: number
    longitude: number
    km: number
}

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Location task error:', error)
        return
    }
    const fileName = await AsyncStorage.getItem(LOCATION_TASK_FILENAME)
    const trackKm = await AsyncStorage.getItem(LOCATION_TASK_TRACK_KM)
    const last_km = await AsyncStorage.getItem(LOCATION_TASK_LAST_KM)
    const dirs = await AsyncStorage.getItem(KEY_DIRS)
    if (!fileName || !trackKm || !dirs) return

    const { locations } = data as any
    if (!locations?.length) return

    const loc = locations[0]
    const km = coord2km(
        JSON.parse(trackKm),
        loc.coords.latitude,
        loc.coords.longitude,
        // { last_km: last_km ? Number(last_km) : undefined },
    )
    await AsyncStorage.setItem(LOCATION_TASK_LAST_KM, String(km))
    const time = new Date().getTime()
    const record: LocationRecord = {
        timestamp: loc.timestamp,
        time_OS: time,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        km,
    }
    console.log(record)

    const line = JSON.stringify(record) + '\n'
    const log_dir = JSON.parse(dirs)[LOGS_DIR]
    const file = await getOrCreateFile(new Directory(log_dir), fileName)
    const content = await file.text()

    file.write(content + line, { encoding: 'utf8' })
})
