import { Server, Socket } from 'socket.io'
import { Room } from './roomManager'

export function handleUserEvents(
    io: Server,
    socket: Socket,
    room: Room,
    roomId: string
): void {
    socket.on('buzz', () => {
        if (!room.firstBuzzer && !room.eliminatedUsers.has(socket.id)) {
            room.firstBuzzer = socket.id
            io.to(room.adminId!).emit('hasBuzzed', {
                socketId: socket.id,
                userName: room.users.get(socket.id),
            })
            io.to(roomId).emit('disable')
            socket.emit('youBuzzed')
        }
    })
}

export default handleUserEvents
