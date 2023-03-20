//Main block
{
    // Initializes a socket for the client and emits a `connection` event
    const socket = io(); //this socket means clientSocket in server, it emits event and handle itself
    socket.on('connected', (_) => onSocketConnection(socket));
    socket.on('authenticated-user', (_) => onSocketAuthenticate(socket));
    socket.on('force-disconnect', (data) => onSocketForceDisconnet(socket, data = {}));
}

//Socket Connection phase
{   
    function onSocketConnection (socket) {
        //Accumulate data to initialize authenticating phase 
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const join = document.getElementById('join-button');
        const exit = document.getElementById('exit');
    
        addEventEnterToClick(password, join);
    
        join.onclick = () => {
            socket.emit('authenticating-user', 
            {
                username : username.value,
                password : password.value
            });
        };
        
        exit.onclick = () => {
            window.location.reload();
        }

    }

    //sub-function
    function addEventEnterToClick(elementToEnter, elementToClick) {
        elementToEnter && (elementToEnter.onkeydown = (e) => {
            e.code === 'Enter' && elementToClick?.click();
        });
    }
    
}

//After authenticating Users phase then authenticate receiver to send message and display messages
{
    function onSocketAuthenticate(socket) {
        permitSocketToSendMessage(socket);
        permitSocketToReceiveMessage(socket);
    }
    
    function permitSocketToSendMessage (socket) {
         const message = document.getElementById('message');
         const receiver = document.getElementById('receiver');
         const send_button = document.getElementById('send-button');

         addEventEnterToClick(message, send_button);
         //addEventEnterToClick(receiver, send_button);

         send_button.onclick = () => {
            if(message.value !== '' && receiver.value !== ''){
                socket.emit('send-message', 
                {
                    message: message.value,
                    receiver: receiver.value
                }
                )
            }  
         };
         
         //Display chat box
         document.getElementById('sign-in').hidden = true;
         document.getElementById('chat-box').hidden = false;
    }

    function permitSocketToReceiveMessage(socket) {
        socket.on('receive-message', (data) => onSocketReceiveMessage(data));
    }

    function onSocketReceiveMessage(data) {
        const {sendAt , sender , receiver, message} = data; 
        const element = document.createElement('div');
        element.innerText = `${new Date(sendAt).toJSON()} ${sender} to ${receiver} : ${message}`;
        document.getElementById('inbox').appendChild(element);    
    }
}

//When failing in authenticating phase
{
    function onSocketForceDisconnet(socket, data = {}) {
        const {reason} = data;
        alert(`Another ${socket.username} ${reason}, please connect again!!!`);
        window.location.reload();
    }
}

