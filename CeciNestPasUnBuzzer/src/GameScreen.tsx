// src/GameScreen.tsx
import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    BackHandler,
} from 'react-native'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import { RootStackParamList } from '../App'
import socket from './socket'
import { Animated } from 'react-native'

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>

type Props = {
    route: GameScreenRouteProp
    navigation: any
}

const GameScreen: React.FC<Props> = ({ route, navigation }) => {
    const { userName, roomId } = route.params
    const [gameState, setGameState] = useState<
        'enabled' | 'disabled' | 'buzzed' | 'userBuzzed'
    >('enabled')
    const [buzzedUser, setBuzzedUser] = useState<string | null>(null)
    const [pulseAnim] = useState(new Animated.Value(1))

    const leaveRoom = useCallback(() => {
        socket.emit('leaveRoom', { roomId, userName })
        socket.off('disable')
        socket.off('enable')
        socket.off('youBuzzed')
        socket.off('hasBuzzed')
    }, [roomId, userName])

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                leaveRoom()
                navigation.goBack()
                return true
            }

            BackHandler.addEventListener('hardwareBackPress', onBackPress)

            return () =>
                BackHandler.removeEventListener(
                    'hardwareBackPress',
                    onBackPress
                )
        }, [leaveRoom, navigation])
    )

    useEffect(() => {
        socket.on('disable', () => setGameState('disabled'))
        socket.on('enable', () => setGameState('enabled'))
        socket.on('youBuzzed', () => {
            setGameState('buzzed')
        })
        socket.on('hasBuzzed', (user: string) => {
            setBuzzedUser(user)
            setGameState('userBuzzed')
        })

        return () => {
            leaveRoom()
        }
    }, [leaveRoom])

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    const handleBuzz = () => {
        socket.emit('buzz', roomId)
    }

    const getBackgroundColor = () => {
        switch (gameState) {
            case 'buzzed':
                return '#90EE90' // Light green
            case 'userBuzzed':
                return '#FFB6C1' // Light red
            default:
                return '#FFFFFF' // White
        }
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
            ]}
        >
            <Text style={styles.userName}>
                You are {userName}, you are wise and fast.
            </Text>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        gameState !== 'enabled' && styles.disabledButton,
                    ]}
                    onPress={handleBuzz}
                    disabled={gameState !== 'enabled'}
                >
                    <Text style={styles.buttonText}>Buzz</Text>
                </TouchableOpacity>
            </Animated.View>

            {gameState === 'buzzed' && (
                <Text style={styles.buzzedText}>You buzzed!</Text>
            )}

            {gameState === 'userBuzzed' && buzzedUser && (
                <Text style={styles.buzzedText}>{buzzedUser} buzzed!</Text>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    userName: {
        fontSize: 20,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#000',
        padding: 20,
        width: 200,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#888',
    },
    buttonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    buzzedText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 30,
        letterSpacing: 1,
    },
    gameState: {
        fontSize: 18,
        marginTop: 30,
        fontStyle: 'italic',
    },
})

export default GameScreen
