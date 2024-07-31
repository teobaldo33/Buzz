// src/AdminScreen.tsx
import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../App'
import socket from './socket'

type AdminScreenRouteProp = RouteProp<RootStackParamList, 'Admin'>

type Props = {
    route: AdminScreenRouteProp
}

const AdminScreen: React.FC<Props> = ({ route }) => {
    const [players, setPlayers] = useState<string[]>([])
    const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null)
    const { roomId } = route.params
    const { userList } = route.params

    useEffect(() => {
        console.log('Current players:', players)
    }, [players])

    useEffect(() => {
        if (userList) {
            setPlayers(userList.map((user) => user.userName))
        }

        socket.on(
            'userConnected',
            (data: { socketId: string; userName: string }) => {
                console.log('User connected:', data)
                setPlayers((prevPlayers) => [...prevPlayers, data.userName])
            }
        )

        socket.on(
            'userDisconnected',
            (data: { socketId: string; userName: string }) => {
                console.log('User disconnected:', data.userName)
                setPlayers((prevPlayers) =>
                    prevPlayers.filter((player) => player !== data.userName)
                )
            }
        )

        // Listen for buzz events
        socket.on(
            'hasBuzzed',
            (data: { socketId: string; userName: string }) => {
                setBuzzedPlayer(data.userName)
            }
        )

        // Clean up listeners on unmount
        return () => {
            socket.off('userConnected')
            socket.off('userDisconnected')
            socket.off('hasBuzzed')
        }
    }, [])

    const handleReset = () => {
        socket.emit('reset')
        setBuzzedPlayer(null)
    }

    const handleRelaunch = () => {
        socket.emit('relaunch')
        setBuzzedPlayer(null)
    }

    return (
        <View style={styles.container}>
            {buzzedPlayer && (
                <Text style={styles.buzzedPlayer}>Buzzed: {buzzedPlayer}</Text>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleReset}>
                    <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRelaunch}
                >
                    <Text style={styles.buttonText}>Relaunch</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.roomIdText}>Room ID: {roomId}</Text>

            <Text style={styles.title}>Players in Room</Text>
            {players.length === 0 ? (
                <Text>No players in the room yet.</Text>
            ) : (
                <FlatList
                    data={players}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Text style={styles.playerItem}>{item}</Text>
                    )}
                />
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
        width: 130,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        letterSpacing: 1,
    },
    roomIdText: {
        fontSize: 18,
        marginBottom: 30,
        fontStyle: 'italic',
    },
    playerItem: {
        fontSize: 18,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    buzzedPlayer: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 30,
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        width: '80%',
        marginVertical: 20,
    },
})
export default AdminScreen
