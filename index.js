const express = require("express");
const config = require('./config');
const Database = require('./db'); //Execption of Importing flow, for setting up
const MessageRouter = require("./routers/message");

//Main block
{
  Database.connect(config.MONGODB_URL, config.MONGODB_DB);

  const app = express();
  const server = require("http").createServer(app);

  const createSocket = require("socket.io");
  const serverSocket = createSocket(server);

  serverSocket.on("connection", (clientSocket) =>
    handleSocketConnection(clientSocket)
  );

  app.use(express.static("public"));
  app.get("/", (_, res) => res.sendFile("index.html"));

  // Configure bodyparser to handle post requests
  const bodyParser = require("body-parser");
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use("/message", MessageRouter);

  server.listen(config.HTTP_PORT);
}


const databaseUsers = require("./databaseUsers.json");
const connectedUsers = [];


//SHELL handling real-time chat
{
  function handleSocketConnection(clientSocket) {
    clientSocket.emit("connected", { id: clientSocket.id });

    clientSocket.on("authenticating-user", (data) => {
      handleSocketAuthenticate(clientSocket, data);
    });

    clientSocket.on("send-message", (data) =>
      handleSocketSendMessage(clientSocket, data)
    );

    clientSocket.on("disconnected", (_) =>
      handleSocketDisconnetion(clientSocket)
    );
  }
}

//FUNCTION LAYER 1: authenticating-user
{
  function handleSocketAuthenticate(socket, data = {}) {
    const { username, password } = data;

    // check if a user with the specific username and password existing in database
    const validated = validateUsernameAndPassword(username, password);

    if (validated) {
      socket.username = username; // Assign Nick-name used by authenticated user in the chatting platform
      socket.emit("authenticated-user", {});
      log(`${username} joined ${socket.id}`);

      //If anyone access with an existing username in the chatting, force the existing user to disconnect and inform it
      //Validate in connectedUser
      forceUserToDisconnect(username, "joined somewhere ");
      connectedUsers.push(socket);
      setTimeout(() => forceUserToDisconnect(username, "timeout"), 696969);
    }
  }

  //Function layer 2
  function validateUsernameAndPassword(username, password) {
    const matched = databaseUsers.some((user) => {
      return user.username === username && user.password === password;
    });
    return matched;
  }

  //Function layer 2
  function forceUserToDisconnect(username, reason = "unknow") {
    const index = connectedUsers.findIndex(
      (element) => element.username === username
    );
    //If there is an user posssessing identical username with username inputing from client
    if (index !== -1) {
      const identicalUser = connectedUsers[index];
      identicalUser.emit("force-disconnect", { reason });
      connectedUsers.splice(index, 1);
    }
  }
}

//FUNCTION lAYER 1: send-message
{
  function handleSocketSendMessage(socket, data = {}) {
    const { destination, message } = data;
    const sender = socket.username;
    const receiver = !!destination ? to : "*";
    const receivers =
      receiver === "*"
        ? [...connectedUsers]
        : [
            socket,
            connectedUsers.find((sk) => {
              return (
                sk.connectedUsers &&
                sk.username === destination &&
                sk.username != socket.username
              );
            }),
          ];

    receivers.forEach((sk) => {
      sk?.emit("receive-message", {
        sendAt: Date.now(),
        sender: sender,
        receiver: receiver,
        message: message,
      });
    });
    log(`${sender} to ${receiver}: ${message}`);
  }

  //Function layer 2
  function log(message = "??") {
    console.log(`${Date.now()} ${message}`);
  }
}

//FUNCTION LAYER 1: disconnected
{
  function handleSocketDisconnetion(socket) {
    log(`${socket.username} left ${socket.id}`);
  }
}
