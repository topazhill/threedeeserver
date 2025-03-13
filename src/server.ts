import { createServer } from 'http';
import { Server } from 'socket.io';
import * as express from 'express';
import * as path from 'path';

const clients: { [id:string]: any } = {};

const port: number = 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Accept'],
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    clients[socket.id] = {};
    socket.emit('id', socket.id);

    socket.on('disconnect', () => {
        if (clients && clients[socket.id]) {
            delete clients[socket.id];
            io.emit('removeClient', socket.id);
            console.log('a user disconnected');
        }
    });

    socket.on('update', (data) => {
        if (clients[socket.id]) {
            clients[socket.id] = data;
        }
    });
});

setInterval(() => {
    io.emit('clients', clients);
}, 1000 / 60);

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});