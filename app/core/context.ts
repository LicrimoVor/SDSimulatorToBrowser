import { createContext, useContext } from 'react'
import { ALL_DIRS } from './const'

export type GlobalContextType = {
    dirs: ALL_DIRS
    theme: 'light' | 'dark'
    change: (context: GlobalContextType) => void
}

export const GlobalContext = createContext<GlobalContextType>({
    dirs: {},
    theme: 'light',
    change: (context: GlobalContextType) => {},
})

export const useGlobalContext = () => {
    const context = useContext(GlobalContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
