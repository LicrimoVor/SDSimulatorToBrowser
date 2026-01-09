import { DEFAULT_ROOT_DIR, KEY_DIRS, LOGS_DIR } from '@/core/const'
import {
    LOCATION_TASK,
    LOCATION_TASK_FILENAME,
    LocationRecord,
} from '@/core/tasks'
import * as Location from 'expo-location'
import { Directory, File } from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getOrCreateFile } from './createFile'

export async function requestLocationPermissions() {
    const fg = await Location.requestForegroundPermissionsAsync()
    if (fg.status !== 'granted') {
        throw new Error('Foreground location permission denied')
    }

    const bg = await Location.requestBackgroundPermissionsAsync()
    if (bg.status !== 'granted') {
        throw new Error('Background location permission denied')
    }
}

export async function startLocationRecording(fileName: string) {
    console.log('starting location')
    await AsyncStorage.setItem(LOCATION_TASK_FILENAME, fileName)
    const dirs = await AsyncStorage.getItem(KEY_DIRS)
    if (!dirs) return

    const log_dir = JSON.parse(dirs)[LOGS_DIR]
    await getOrCreateFile(new Directory(log_dir), fileName)

    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
    if (started) return

    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10_000,
        distanceInterval: 100,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
            notificationTitle: 'Запись местоположения',
            notificationBody: 'Идет фоновая запись координат',
            notificationColor: '#1976D2',
        },
        pausesUpdatesAutomatically: false,
    }).then(() => console.log('started'))
}

export async function stopLocationRecording() {
    console.log('stoping location')
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
    if (started) {
        console.log('STOP')
        await AsyncStorage.removeItem(LOCATION_TASK_FILENAME)
        await Location.stopLocationUpdatesAsync(LOCATION_TASK)
    }
    return started
}

export async function getLocationFromFile(filename: string) {
    console.log('reading location')
    const dirs = await AsyncStorage.getItem(KEY_DIRS)
    const dirs_parsed = dirs && JSON.parse(dirs)
    const dir = dirs
        ? dirs_parsed[LOGS_DIR]
        : `${DEFAULT_ROOT_DIR}/${LOGS_DIR}/`

    const file = await getOrCreateFile(new Directory(dir), filename)
    const content = await file.text().then((text) => text.trim())
    try {
        const data = content.split('\n').map((item) => JSON.parse(item))
        return data as LocationRecord[]
    } catch {
        return []
    }
}
