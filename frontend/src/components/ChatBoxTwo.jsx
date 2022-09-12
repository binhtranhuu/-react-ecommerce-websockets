import React, { useContext, useEffect, useRef, useState } from "react";
import { WebsocketContext } from "../WebsocketContext";

function ChatBoxTwo(props) {
  const { userInfo } = props;
  const { ws } = useContext(WebsocketContext);
  const uiMessagesRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([
    { name: "Admin", body: "Hello there, Please ask your question." },
  ]);

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: "smooth",
      });
    }

    if (ws.current) {
      ws.current.onmessage = function ({ data }) {
        const packet = JSON.parse(data);

        switch (packet.type) {
          case "message":
            const message = packet.content;
            setMessages([
              ...messages,
              { body: message.body, name: message.name },
            ]);
            break;
          default:
            break;
        }
      };
    }
  }, [ws.current, messages, isOpen, userInfo]);

  const supportHandler = () => {
    setIsOpen(true);
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

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }]);
      setMessageBody("");
      setTimeout(() => {
        ws.current.send(
          JSON.stringify({
            type: "onMessage",
            content: {
              body: messageBody,
              name: userInfo.name,
              isAdmin: userInfo.isAdmin,
              _id: userInfo._id,
            },
          })
        );
      }, 1000);
    }
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  return (
    <div className="chatbox">
      {!isOpen ? (
        <button type="button" onClick={supportHandler}>
          <i className="fa fa-support" />
        </button>
      ) : (
        <div className="card card-body">
          <div className="row">
            <strong>Support </strong>
            <button type="button" onClick={closeHandler}>
              <i className="fa fa-close" />
            </button>
          </div>
          <ul ref={uiMessagesRef}>
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
  );
}

export default ChatBoxTwo;
