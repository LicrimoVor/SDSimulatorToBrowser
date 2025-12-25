import { LOGS_DIR } from '@/core/const'
import {
    LOCATION_TASK,
    LOCATION_TASK_FILENAME,
    LocationRecord,
} from '@/core/tasks'
import * as Location from 'expo-location'
import { File } from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
        await Location.stopLocationUpdatesAsync(LOCATION_TASK)
    }
}

export async function getLocationFromFile(filename: string) {
    console.log('reading location')
    const file = new File(LOGS_DIR.uri + filename)
    const content = await file.text().then((text) => text.trim())
    const data = content.split('\n').map((item) => JSON.parse(item))
    return data as LocationRecord[]
}
