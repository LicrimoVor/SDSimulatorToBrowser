import { Href, Link as LinkExpo } from 'expo-router'
import { ReactElement } from 'react'
import { Pressable, StyleProp, TextStyle } from 'react-native'

interface StatusProps {
    children: ReactElement
    href: Href
    style?: StyleProp<TextStyle>
}

export function Link(props: StatusProps) {
    return (
        <LinkExpo href={props.href} asChild style={props.style}>
            <Pressable>{props.children}</Pressable>
        </LinkExpo>
    )
}
