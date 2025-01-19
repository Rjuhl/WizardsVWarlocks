import { Server, Socket } from 'socket.io';

interface OnlineUsers {
    [username: string]: boolean;
}

interface SocketToUser {
    [socketId: string]: string;
}

interface Challenges {
    [foe: string]: { [challenger: string]: boolean };
}

export default function socketHandler(io: Server): void {
    const onlineUsers: OnlineUsers = {};
    const socketToUser: SocketToUser = {};
    const challenges: Challenges = {};

    io.on('connection', (socket: Socket) => {
        console.log(`Socket ${socket.id} connected`);

        // User comes online
        socket.on('userOnline', (username: string) => {
            console.log(`${username} connected`);
            onlineUsers[username] = true;
            socketToUser[socket.id] = username;
            io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
        });

        // User goes offline
        socket.on('userOffline', (username: string) => {
            console.log(`${username} disconnected`);
            delete onlineUsers[username];
            delete socketToUser[socket.id];
            io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
        });

        // User challenges another user
        socket.on('challenge', (challenger: string, foe: string) => {
            if (!challenges[foe]) challenges[foe] = {};
            challenges[foe][challenger] = true;

            if (challenges[challenger]?.[foe]) {
                // Create a room and notify both users
                const roomName = `room-${challenger}-${foe}`;
                socket.join(roomName);
                io.to(roomName).emit('challengeAccepted', { roomName, challenger, foe });
                console.log(`Room ${roomName} created between ${challenger} and ${foe}`);
            } else {
                // Notify the foe of a challenge
                io.emit('newChallenge', { challenger, foe });
                console.log(`${challenger} challenged ${foe}`);
            }
        });

        // Cancel a challenge
        socket.on('cancelChallenge', (challenger: string, foe: string) => {
            if (challenges[foe]) {
                delete challenges[foe][challenger];
                console.log(`${challenger} canceled challenge to ${foe}`);
            }
        });

        // Handle user disconnecting
        socket.on('disconnect', () => {
            const username = socketToUser[socket.id];
            if (username in onlineUsers) {
                console.log(`${username} disconnected`);
                delete onlineUsers[username];
                delete socketToUser[socket.id];
                io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
            }
        });
    });
}
