import { Server, Socket } from 'socket.io'
import RoomManager from './roomManager.js'
import { handleUserEvents } from './userHandlers.js'
import { handleAdminEvents } from './adminHandlers.js'
import { log } from 'console'

export function handleConnection(
    io: Server,
    socket: Socket,
    roomManager: RoomManager
): void {
    // const userType = socket.handshake.query.userType as string
    // const userName = socket.handshake.query.userName as string

    socket.on('createRoom', (callback: (roomId: string) => void) => {
        const roomId = roomManager.createRoom(socket.id)
        console.log(`Room created: ${roomId}`)
        socket.join(roomId)
        roomManager.setAdmin(roomId, socket.id)
        handleAdminEvents(io, socket, roomManager.getRoom(roomId)!, roomId)
        callback(roomId)
    })

    socket.on(
        'joinRoom',
        (
            payload: { userName: string; roomId: string; userType: string },
            callback: (response: {
                error?: string
                success: boolean
                userList?: { socketId: string; userName: string }[]
            }) => void
        ) => {
            console.log('Attempting to join room:', payload.roomId)
            const room = roomManager.getRoom(payload.roomId)

            log(payload, callback)

            if (!room) {
                console.log('Room not found')
                return callback({ success: false, error: 'Room not found' })
            }

            socket.join(payload.roomId)
            roomManager.addUserToRoom(
                payload.roomId,
                socket.id,
                payload.userName
            )
            console.log(
                `User ${payload.userName} (${socket.id}) added to room ${payload.roomId}`
            )
            console.log(payload)

            io.to(room.adminId!).emit('userConnected', {
                socketId: socket.id,
                userName: payload.userName,
            })

            if (payload.userType === 'admin') {
                log('Setting admin')
                roomManager.setAdmin(payload.roomId, socket.id)
                handleAdminEvents(io, socket, room, payload.roomId)
                const userList = Array.from(room.users).map(
                    ([socketId, userName]) => ({ socketId, userName })
                )
                return callback({ success: true, userList })
            } else {
                log('Setting user')
                handleUserEvents(io, socket, room, payload.roomId)
                return callback({ success: true })
            }
        }
    )

    socket.on('disconnect', () => {
        roomManager.getAllRooms().forEach((room, roomId) => {
            if (room.users.has(socket.id)) {
                const userName = room.users.get(socket.id)
                roomManager.removeUserFromRoom(roomId, socket.id)
                io.to(room.adminId!).emit('userDisconnected', {
                    socketId: socket.id,
                    userName,
                })
            }
            if (socket.id === room.adminId) {
                room.adminId = null
            }
            if (room.users.size === 0 && !room.adminId) {
                roomManager.deleteRoom(roomId)
            }
        })
    })

    socket.on('leaveRoom', ({ roomId, userName }) => {
        log(`User ${userName} (${socket.id}) left room ${roomId}`)
        const room = roomManager.getRoom(roomId)
        log(room)
        if (!room) return
        room.users.delete(socket.id)
        io.to(roomId).emit('userDisconnected', {
            socketId: socket.id,
            userName,
        })
        log(room.users)
        if (socket.id === room.adminId) {
            room.adminId = null
        }
        if (room.users.size === 0 && !room.adminId) {
            roomManager.deleteRoom(roomId)
        }
    })
}
