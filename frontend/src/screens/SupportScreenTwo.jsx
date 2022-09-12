import React, { useContext, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { WebsocketContext } from "../WebsocketContext";
import MessageBox from "../components/MessageBox";

let allUsers = [];
let allMessages = [];
let allSelectedUser = {};

function SupportScreenTwo(props) {
  const { ws } = useContext(WebsocketContext);
  const uiMessagesRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState({});
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  useEffect(() => {
    if (ws.current) {
      ws.current.onmessage = function ({ data }) {
        const packet = JSON.parse(data);

        switch (packet.type) {
          case "updateUser":
            const updatedUser = packet.content;
            console.log("updatedUser is: ", updatedUser);
            const existUser = allUsers.find(
              (user) => user._id === updatedUser._id
            );
            if (existUser) {
              allUsers = allUsers.map((user) =>
                user._id === existUser._id ? updatedUser : user
              );
              setUsers(allUsers);
            } else {
              allUsers = [...allUsers, updatedUser];
              setUsers(allUsers);
            }
            break;
          case "message":
            const data = packet.content;
            if (allSelectedUser._id === data._id) {
              allMessages = [...allMessages, data];
            } else {
              const existUser = allUsers.find((user) => user._id === data._id);
              if (existUser) {
                allUsers = allUsers.map((user) =>
                  user._id === existUser._id ? { ...user, unread: true } : user
                );
                setUsers(allUsers);
              }
            }
            setMessages(allMessages);
            break;
          case "listUsers":
            allUsers = packet.content;
            setUsers(allUsers);
            break;
          case "selectUser":
            allMessages = packet.content.messages;
            setMessages(allMessages);
            break;
          default:
            break;
        }
      };
    }
  }, [ws.current]);

  const selectUser = (user) => {
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    ws.current.send(
      JSON.stringify({
        type: "onUserSelected",
        content: user,
      })
    );
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      allMessages = [
        ...allMessages,
        { body: messageBody, name: userInfo.name },
      ];
      setMessages(allMessages);
      setMessageBody("");
      setTimeout(() => {
        ws.current.send(
          JSON.stringify({
            type: "onMessage",
            content: {
              body: messageBody,
              name: userInfo.name,
              isAdmin: userInfo.isAdmin,
              _id: selectedUser._id,
            },
          })
        );
      }, 1000);
    }
  };

  const supportHandler = () => {
    ws.current.send(
      JSON.stringify({
        type: "onLogin",
        content: {
          _id: userInfo._id,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
        },
      })
    );
  };

  return (
    <div className="row top full-container">
      <button type="button" onClick={supportHandler}>
        <i className="fa fa-support" />
      </button>
      <div className="col-1 support-users">
        {users.filter((x) => x._id !== userInfo._id).length === 0 && (
          <MessageBox>No Online User Found</MessageBox>
        )}
        <ul>
          {users
            .filter((x) => x._id !== userInfo._id)
            .map((user) => (
              <li
                key={user._id}
                className={user._id === selectedUser._id ? "  selected" : "  "}
              >
                <button
                  className="block"
                  type="button"
                  onClick={() => selectUser(user)}
                >
                  {user.name}
                </button>
                <span
                  className={
                    user.unread ? "unread" : user.online ? "online" : "offline"
                  }
                />
              </li>
            ))}
        </ul>
      </div>
      <div className="col-3 support-messages">
        {!selectedUser._id ? (
          <MessageBox>Select a user to start chat</MessageBox>
        ) : (
          <div>
            <div className="row">
              <strong>Chat with {selectedUser.name} </strong>
            </div>
            <ul ref={uiMessagesRef}>
              {messages.length === 0 && <li>No message.</li>}
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{`${msg.name}: `}</strong> {msg.body}
                </li>
              ))}
            </ul>
            <div>
              <form onSubmit={submitHandler} className="row">
                <input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  placeholder="type message"
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupportScreenTwo;
