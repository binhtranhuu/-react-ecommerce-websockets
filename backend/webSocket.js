export default function webSocket(wss) {
  const users = [];

  const onLogin = (ws, user) => {
    const updatedUser = {
      ...user,
      online: true,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      console.log("react-use-websocket 1");
      ws.send(
        JSON.stringify({
          type: "updateUser",
          content: updatedUser,
        })
      );
    }
    if (updatedUser.isAdmin) {
      console.log("react-use-websocket 2");
      ws.send(
        JSON.stringify({
          type: "listUsers",
          content: users,
        })
      );
    }
  };

  const onUserSelected = (ws, user) => {
    console.log("onUserSelected is: ", user);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      ws.send(
        JSON.stringify({
          type: "selectUser",
          content: existUser,
        })
      );
    }
  };

  const onMessage = (ws, message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        // io.to(user.socketId).emit("message", message);
        ws.send(
          JSON.stringify({
            type: "message",
            content: message,
          })
        );
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        // io.to(admin.socketId).emit("message", message);
        ws.send(
          JSON.stringify({
            type: "message",
            content: message,
          })
        );
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        ws.send(
          JSON.stringify({
            type: "message",
            content: {
              name: "Admin",
              body: "Sorry. I am not online right now",
            },
          })
        );
      }
    }
  };

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      const packet = JSON.parse(data);

      switch (packet.type) {
        case "onLogin":
          onLogin(ws, packet.content);
          break;
        case "onUserSelected":
          onUserSelected(ws, packet.content);
          break;
        case "onMessage":
          onMessage(ws, packet.content);
          break;
      }
    });
  });
}
