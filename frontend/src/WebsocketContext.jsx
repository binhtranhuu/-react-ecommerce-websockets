import { createContext, useEffect, useRef } from "react";

const WebsocketContext = createContext();

function WebsocketContextProvider(props) {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:6969");

    ws.current.onopen = (event) => {
      console.log("Open:", event);
    };

    ws.current.onclose = (event) => {
      console.log("Close:", event);
    };

    //clean up function
    return () => ws.current.close();
  }, []);

  return (
    <WebsocketContext.Provider
      value={{
        ws,
      }}
    >
      {props.children}
    </WebsocketContext.Provider>
  );
}

export { WebsocketContext, WebsocketContextProvider };
