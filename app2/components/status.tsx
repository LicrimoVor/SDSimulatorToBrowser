import { ThemedView } from './view'

interface StatusProps {
    isOnline: boolean
    size?: number
}

export function Status(props: StatusProps) {
    return (
        <ThemedView
            style={[
                {
                    width: props.size || 14,
                    height: props.size || 14,
                    borderRadius: (props.size || 14) / 2,
                    marginRight: 8,
                    backgroundColor: props.isOnline ? '#34D399' : '#EF4444',
                },
            ]}
        />
    )
}
