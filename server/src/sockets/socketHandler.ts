import { Server, Socket } from 'socket.io';
import { IRooms } from '../resources/interfaces/sockets/IRooms';
import { ISocketUser } from '../resources/interfaces/sockets/ISocketUser';
import { IChallenges } from '../resources/interfaces/sockets/IChallenges';
import { IOnlineUsers } from '../resources/interfaces/sockets/IOnlineUsers';
import { Timer } from './Timer';
import { randomUUID } from 'crypto';

export default function socketHandler(io: Server): void {
    const rooms: IRooms = {};
    const timer: Record<string, Timer> = {};
    const onlineUsers: IOnlineUsers = {};
    const socketToUser: ISocketUser = {};
    const UserToSocket: ISocketUser = {};
    const challenges: IChallenges = {};
    const receivedChallenges: IChallenges = {}; // Currently unused 

    const getChallengersList = (username: string) => {
        return (challenges[username]) ? Object.keys(challenges[username]) : [];
    };

    io.on('connection', (socket: Socket) => {
        console.log(`Socket ${socket.id} connected`);

        // Listen for user list request
        socket.on('getUserList', () => {
            io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
        });

        // Listen for requests for a challenger list
        socket.on('getChallengersList', (username: string) => {
            socket.emit('challengersUpdate', getChallengersList(username));
        });

        // User comes online
        socket.on('userOnline', (username: string) => {
            console.log(`${username} connected`);
            onlineUsers[username] = true;
            socketToUser[socket.id] = username;
            UserToSocket[username] = socket.id;
            io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
        });

        // User goes offline
        socket.on('userOffline', (username: string) => {
            console.log(`${username} disconnected`);
            delete onlineUsers[username];
            delete socketToUser[socket.id];
            delete UserToSocket[username];
            io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
        });

        // User challenges another user
        socket.on('challenge', (challenger: string, foe: string) => {
            console.log(`${challenger} challenged ${foe}`);
            // update challanges
            if (!challenges[foe]) challenges[foe] = {};
            challenges[foe][challenger] = true;

            //update recieved challenges
            if (!receivedChallenges[challenger]) receivedChallenges[challenger] = {};
            receivedChallenges[challenger][foe] = true;

            console.log(challenges);
            if (challenges[challenger]?.[foe] && onlineUsers[foe]) {
                console.log("Challenge begins");
                // Create a room and notify both users
                const roomName = `room-${challenger}-${foe}`;
                io.to(UserToSocket[challenger]).emit("matchRoom", roomName);
                io.to(UserToSocket[foe]).emit("matchRoom", roomName);
                console.log(`Room ${roomName} created between ${challenger} and ${foe}`);
            } else {
                // Notify the foe of a challenge
                if (onlineUsers[foe]) {
                    console.log('Notify foe of challenge');
                    socket.to(UserToSocket[foe]).emit("challengersUpdate", getChallengersList(foe));
                    console.log(`${challenger} challenged ${foe}`);
                } else {
                    // If user challenged is offline remove the challenge
                    delete challenges[foe][challenger];
                    delete receivedChallenges[challenger][foe]
                }
               
            }
        });

        // Cancel a challenge
        socket.on('cancelChallenge', (challenger: string, foe: string) => {
            if (challenges[foe]) {
                delete challenges[foe][challenger];
                socket.to(UserToSocket[foe]).emit("challengersUpdate", getChallengersList(foe));
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
                delete UserToSocket[username];
                io.emit('onlineUserListUpdate', Object.keys(onlineUsers));
            }
        });

        // Handles Game Turns 
        
        // Timer example 
        // const timerName = randomUUID()
        // const timer = Timer(timerName)
        // timers[timerName] = timer
    });
}
