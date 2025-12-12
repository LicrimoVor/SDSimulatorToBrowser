import * as FileSystem from 'expo-file-system'
import { useState, useEffect, useCallback } from 'react'

const DATA_DIR = FileSystem.Paths.document + 'data/'

export function useLocalFiles() {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const readFiles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const dirInfo = await FileSystem.getInfoAsync(DATA_DIR)
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(DATA_DIR, {
                    intermediates: true,
                })
            }

            const names = await FileSystem.readDirectoryAsync(DATA_DIR)

            const detailed = await Promise.all(
                names.map(async (name) => {
                    const filePath = DATA_DIR + name
                    const info = await FileSystem.getInfoAsync(filePath)

                    return {
                        name,
                        path: filePath,
                        size: info.size,
                        modified: info.modificationTime,
                        isFile: info.isDirectory === false,
                    }
                }),
            )

            setFiles(detailed)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        readFiles()
    }, [readFiles])

    return { files, loading, error, refresh: readFiles, dir: DATA_DIR }
}
