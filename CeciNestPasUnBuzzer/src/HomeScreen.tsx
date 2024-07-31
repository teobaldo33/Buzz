import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../App'
import socket from './socket'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FlatList } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons' // Make sure to install @expo/vector-icons

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

type Props = {
    navigation: HomeScreenNavigationProp
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [userName, setUsername] = useState('')
    const [roomId, setRoomId] = useState('')
    const [createdRooms, setCreatedRooms] = useState<string[]>([])

    useEffect(() => {
        loadCreatedRooms()
    }, [])

    const loadCreatedRooms = async () => {
        try {
            const savedRooms = await AsyncStorage.getItem('createdRooms')
            if (savedRooms) {
                setCreatedRooms(JSON.parse(savedRooms))
            }
        } catch (error) {
            console.error('Error loading created rooms:', error)
        }
    }

    const saveCreatedRooms = async (rooms: string[]) => {
        try {
            await AsyncStorage.setItem('createdRooms', JSON.stringify(rooms))
            setCreatedRooms(rooms)
        } catch (error) {
            console.error('Error saving created rooms:', error)
        }
    }

    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(7)
        socket.emit('createRoom', (newRoomId: string) => {
            saveCreatedRooms([...createdRooms, newRoomId])
            navigation.navigate('Admin', { roomId: newRoomId })
        })
    }

    const handleReconnectAsAdmin = (room: string) => {
        socket.emit(
            'joinRoom',
            { roomId: room, userName: '', userType: 'admin' },
            (response: {
                error?: string
                success?: boolean
                userList?: { socketId: string; userName: string }[]
            }) => {
                if (response.success) {
                    navigation.navigate('Admin', {
                        roomId: room,
                        userList: response.userList,
                    })
                } else {
                    alert('Failed to reconnect: ' + response.error)
                }
            }
        )
    }

    const handleJoinRoom = () => {
        if (userName && roomId) {
            socket.emit(
                'joinRoom',
                { roomId, userName, userType: 'user' },
                (response: {
                    error?: string
                    success?: boolean
                    userList?: { socketId: string; userName: string }[]
                }) => {
                    console.log(response)
                    if (response.success) {
                        navigation.navigate('Game', { userName, roomId })
                    } else {
                        alert('Failed to join room: ' + response.error)
                    }
                }
            )
        }
    }

    const handleDeleteRoom = (roomToDelete: string) => {
        const updatedRooms = createdRooms.filter(
            (room) => room !== roomToDelete
        )
        saveCreatedRooms(updatedRooms)
    }

    const handleDeleteAllRooms = () => {
        setCreatedRooms([])
    }

    const renderCreatedRoom = ({ item }: { item: string }) => (
        <View style={styles.createdRoomItem}>
            <Text style={styles.createdRoomText}>Room: {item}</Text>
            <View style={styles.roomIcons}>
                <TouchableOpacity onPress={() => handleReconnectAsAdmin(item)}>
                    <Ionicons name="enter-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteRoom(item)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <Text style={styles.spark}>✦</Text>
            <Text style={styles.title}>Ceci N'est Pas Un Buzzer</Text>
            <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
                <Text style={styles.buttonText}>Create a room</Text>
            </TouchableOpacity>
            {createdRooms.length > 0 && (
                <ScrollView style={styles.createdRoomsContainer}>
                    <View style={styles.createdRoomsHeader}>
                        <Text style={styles.createdRoomsTitle}>
                            Your Created Rooms:
                        </Text>
                        <TouchableOpacity onPress={handleDeleteAllRooms}>
                            <Ionicons
                                name="trash-outline"
                                size={24}
                                color="red"
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={createdRooms}
                        renderItem={renderCreatedRoom}
                        keyExtractor={(item) => item}
                    />
                </ScrollView>
            )}
            <Text style={styles.orText}>OR</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter room ID"
                value={roomId}
                onChangeText={setRoomId}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={userName}
                onChangeText={setUsername}
            />
            <TouchableOpacity
                style={[
                    styles.button,
                    (!userName || !roomId) && styles.disabledButton,
                ]}
                onPress={handleJoinRoom}
                disabled={!userName || !roomId}
            >
                <Text style={styles.buttonText}>Join Room</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    spark: {
        fontSize: 28,
        marginBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 40,
        letterSpacing: 2,
    },
    input: {
        width: '100%',
        borderWidth: 2,
        borderColor: '#000',
        padding: 15,
        marginBottom: 25,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#888',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 25,
    },
    createdRoomsContainer: {
        marginTop: 20,
        width: '100%',
    },
    createdRoomsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    createdRoomsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    createdRoomItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    createdRoomText: {
        fontSize: 16,
    },
    roomIcons: {
        flexDirection: 'row',
    },
    roomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    reconnectButton: {
        backgroundColor: '#4CAF50',
        padding: 5,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 5,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    deleteAllButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
})

export default HomeScreen
