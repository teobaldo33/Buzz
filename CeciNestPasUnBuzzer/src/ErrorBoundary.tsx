// src/ErrorBoundary.tsx
import React, { useState, useEffect, ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
    children: ReactNode
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
    const [hasError, setHasError] = useState(false)
    useEffect(() => {
        const errorHandler = (error: ErrorEvent) => {
            console.error('Uncaught error:', error)
            setHasError(true)
        }
        window.addEventListener('error', errorHandler)
        return () => {
            window.removeEventListener('error', errorHandler)
        }
    }, [])
    if (hasError) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Something went wrong.</Text>
                <Text style={styles.instructionText}>
                    Please restart the app.
                </Text>
            </View>
        )
    }
    return <>{children}</>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 16,
    },
})

export default ErrorBoundary
