import * as Icons from '@expo/vector-icons'
import React from 'react'
import { TextStyle, ViewStyle } from 'react-native'

type IconPackKey = keyof typeof Icons
type IconName<T extends IconPackKey> = T extends IconPackKey
    ? keyof (typeof Icons)[T]['glyphMap']
    : never

export interface IconProps<T extends IconPackKey> {
    type: T
    name: IconName<T>
    size?: number
    color?: string
    style?: ViewStyle | TextStyle
}

export function Icon<T extends IconPackKey>(props: IconProps<T>) {
    const { type, name, size = 24, color = 'black', style } = props

    /*eslint import/namespace : "off"*/
    const IconComponent = Icons[type] as any
    if (!IconComponent) {
        console.warn(`Icon type '${type}' not found in @expo/vector-icons.`)
        return null
    }

    return (
        <IconComponent
            name={name as any}
            size={size}
            color={color}
            style={style}
        />
    )
}
