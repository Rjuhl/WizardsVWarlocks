module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id)

        // Example: Handle a custom event from the client
        socket.on('chatMessage', (msg) => {
            console.log('Message received:', msg)
            io.emit('chatMessage', msg) // Broadcast the message to all connected clients
        });

        // Example: Handle user disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })

        // You can define more socket events here as needed
    })
}