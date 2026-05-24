import { useEffect } from "react";
import useCache from "./cache/index.js";
import { socket } from "./socket/index.js";
import toast from "./utils/toast.js";
import { Toaster } from "react-hot-toast";
import UnConnected from "./components/unconnected.jsx";
import Main from "./components/main.jsx";
import "./App.css";

function App() {
  const socketConnected = useCache((state) => state.socketConnected);
  const setSocketConnected = useCache((state) => state.setSocketConnected);

  useEffect(() => {
    const onConnect = () => {
      setSocketConnected(true);
      toast.success("服务已连接");
    };
    const onDisconnect = () => {
      setSocketConnected(false);
      toast.info("服务已断开");
    };
    const onMessage = (data) => {
      toast.info(`Server:${JSON.stringify(data)}`);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("message", onMessage);
    if (socket.connected) {
      setSocketConnected(true);
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.disconnect();
    };
  }, [setSocketConnected]);

  return (
    <>
      {socketConnected ? <Main /> : <UnConnected />}
      <Toaster />
    </>
  );
}

export default App;
