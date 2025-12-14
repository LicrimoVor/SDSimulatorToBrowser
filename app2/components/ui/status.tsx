import { ThemedView } from '../view'

export const StatusCircle = ({ isActive }: { isActive: boolean }) => {
    return (
        <ThemedView
            style={[
                {
                    width: 14,
                    height: 14,
                    borderRadius: 6,
                    marginRight: 8,
                    backgroundColor: isActive ? '#34D399' : '#EF4444',
                },
            ]}
        />
    )
}
