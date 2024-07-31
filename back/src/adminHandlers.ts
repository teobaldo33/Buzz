import { Server, Socket } from 'socket.io'
import { Room } from './roomManager'
import { log } from 'console'

export function handleAdminEvents(
    io: Server,
    socket: Socket,
    room: Room,
    roomId: string
): void {
    // Send current user list to admin
    room.users.forEach((userName, socketId) => {
        socket.emit('userConnected', { socketId, userName })
    })

    socket.on('relaunch', () => {
        log('Relaunching')
        if (!room.firstBuzzer) return
        room.eliminatedUsers.add(room.firstBuzzer)
        io.to(roomId).emit('enable')
        room.eliminatedUsers.forEach((userId) => {
            io.to(userId).emit('disable')
        })
        room.firstBuzzer = null
    })

    socket.on('reset', () => {
        room.eliminatedUsers.clear()
        io.to(roomId).emit('enable')
        room.firstBuzzer = null
    })
}
