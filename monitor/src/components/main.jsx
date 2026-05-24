
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import evpLogo from 'evp-design-ui/evp-icon/evp.svg'
import request from '../api/request.js'
import { Button, Dom, ToolTip } from 'evp-design-ui'
import { socket } from '../socket/index.js'
import toast from '../utils/toast.js'
import { useEffect, useState } from 'react'

export default function Main() {

  const [status, statusSet] = useState(false);

  useEffect(() => {
    const onStatus = (nextStatus) => {
      toast[nextStatus ? 'success' : 'info'](`拦截器状态: ${nextStatus ? '启用' : '休眠'}`);
      statusSet(nextStatus);
    };

    socket.on('status', onStatus);
    if (socket.connected) {
      socket.emit('status');
    }

    return () => {
      socket.off('status', onStatus);
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://evanpatchouli.github.io/evp-design-ui/" target="_blank">
          <img src={evpLogo} className="logo" alt="Evp logo" />
        </a>
      </div>
      <h1>Vite + React + Evp</h1>
      <div className="card">
        <Dom display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <ToolTip content="点击刷新状态">
            <Button
              text={status ? "监听中" : "休眠"}
              theme="white"
              light
              $click={() => {
                request.GET("/api/status").then((res) => {
                  const nextStatus = res.data;
                  statusSet(nextStatus);
                  toast.info(`拦截器状态: ${nextStatus ? "启用" : "休眠"}`);
                });
              }}
            />
          </ToolTip>
          <Button
            $click={async () => {
              await request.POST(status ? "/api/stop" : "/api/start");
              // (res.type === 'Ok' && res.msg) ? toast.success(res.msg) : toast.error(res.msg);
            }}
            theme="dark"
            ripple
          >
            {status ? "停止" : "启用"}监听
          </Button>
        </Dom>
        <p>
          Edit <code>src/App.jsx</code> to customize the monitor
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite, React and Evp logos to learn more</p>
    </>
  );
}
