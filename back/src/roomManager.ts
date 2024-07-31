import { v4 as uuidv4 } from 'uuid'
import { Socket } from 'socket.io'

export interface Room {
    adminId: string | null
    users: Map<string, string> // socketId -> userName
    firstBuzzer: string | null
    eliminatedUsers: Set<string>
}

class RoomManager {
    rooms: Map<string, Room>

    constructor() {
        this.rooms = new Map<string, Room>()
    }

    createRoom(adminId: string): string {
        const roomId = uuidv4()
        this.rooms.set(roomId, {
            adminId,
            users: new Map<string, string>(),
            firstBuzzer: null,
            eliminatedUsers: new Set<string>(),
        })
        return roomId
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    getAllRooms(): Map<string, Room> {
        return this.rooms
    }

    deleteRoom(roomId: string): void {
        this.rooms.delete(roomId)
    }

    addUserToRoom(roomId: string, socketId: string, userName: string): void {
        const room = this.rooms.get(roomId)
        if (room) {
            room.users.set(socketId, userName)
        }
    }

    removeUserFromRoom(roomId: string, socketId: string): void {
        const room = this.rooms.get(roomId)
        if (room) {
            room.users.delete(socketId)
        }
    }

    isAdmin(roomId: string, socketId: string): boolean {
        const room = this.rooms.get(roomId)
        return room ? room.adminId === socketId : false
    }

    setAdmin(roomId: string, socketId: string): void {
        const room = this.rooms.get(roomId)
        if (room) {
            room.adminId = socketId
        }
    }
}

export default RoomManager
