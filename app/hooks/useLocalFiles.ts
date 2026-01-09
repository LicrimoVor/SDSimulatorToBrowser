import { Directory, File, Paths } from 'expo-file-system'
import { useState, useEffect, useCallback } from 'react'

export type LocalFile = {
    name: string
    file: File
    size?: number
    modified?: number
}

export function useLocalFiles() {
    const [files, setFiles] = useState<LocalFile[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const readFiles = useCallback((dir: Directory) => {
        try {
            setLoading(true)
            setError(null)

            const files = dir.listAsRecords()
            const detailed: LocalFile[] = files
                .map(({ uri, isDirectory }) => {
                    if (Boolean(isDirectory)) {
                        return
                    }
                    const file = new File(uri)
                    const info = file.info()

                    return {
                        name: file.name,
                        file: file as File,
                        size: info.size,
                        modified: info.modificationTime,
                    }
                })
                .filter((val) => val != undefined)
                .sort(
                    (a, b) =>
                        -(
                            (a.file?.creationTime || a.modified || 0) -
                            (b.file?.creationTime || b.modified || 0)
                        ),
                )

            setFiles(detailed)

            // const test_file = detailed[0]
            // if (test_file)  {
            //     setFiles(Array(1000).fill(0).map((_, i) => ({...test_file, name: `${i}.jpg`})))
            // }
        } catch (e) {
            console.log(e)
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    return { files, loading, error, refresh: readFiles }
}
