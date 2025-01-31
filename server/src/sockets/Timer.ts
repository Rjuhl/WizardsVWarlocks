import { IRooms } from "../resources/interfaces/sockets/IRooms";

export class Timer {
    private id: string;
    private parent: Record<string, Timer>;
    private intervalId?: NodeJS.Timeout;
    private rooms: IRooms;
    private roomName: string;
    private player1Username: string;
    private player1SocketId: string;
    private player2Username: string;
    private player2SocketId: string;
    private io: any;
    private duration: number = 1000 * 60 * 5 * 100;
    private prevLedgerSize = 0;

    constructor(
        id: string, 
        parent: Record<string, Timer>,
        rooms: IRooms,
        roomName: string,
        player1Username: string,
        player1SocketId: string,
        player2Username: string,
        player2SocketId: string,
        io: any
    ) {
        this.rooms = rooms;
        this.roomName = roomName;
        this.player1Username = player1Username;
        this.player1SocketId = player1SocketId;
        this.player2Username = player2Username;
        this.player2SocketId = player2SocketId;
        this.io = io;

        this.id = id;
        this.parent = parent;
        parent[id] = this;
    }

    public deleteSelf() {
        clearInterval(this.intervalId)
        delete this.parent[this.id];
    }

    private executeTask() {
        if (!this.rooms[this.roomName] || this.rooms[this.roomName].gameOver()) this.deleteSelf();
        if (this.prevLedgerSize >= this.rooms[this.roomName].getLedger().length) {
            const winner = this.rooms[this.roomName].getTimeOutWinner();
            this.io.to(this.player1SocketId).emit("winner", winner);
            this.io.to(this.player2SocketId).emit("winner", winner);

            // In future award gold for timeout win
            console.log(`${this.player1Username} or ${this.player2Username} should have won gold`);

            delete this.rooms[this.roomName];
            this.deleteSelf();
        }
    }

    public start() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.executeTask();
        }, this.duration);
    }
}