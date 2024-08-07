"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"; // Importa Socket
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import BackButton from "@/components/backButton";

const Chat = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<
    { sender: string; content: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null); // Maneja el socket como estado

  useEffect(() => {
    // Asegúrate de que este código se ejecuta solo en el cliente
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("access_token"); // Obtén el token del almacenamiento local

      if (userData && token) {
        const user = JSON.parse(userData);
        setUsername(user.first_name + " " + user.last_name);

        // Establece la conexión de WebSocket con el token
        const newSocket = io(`http://localhost:3005/chat?token=${token}`);
        setSocket(newSocket);

        // Configura los manejadores de eventos del socket
        newSocket.on(
          "message",
          (message: { sender: string; content: string }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        );

        newSocket.emit("join", user.first_name + " " + user.last_name);

        // Desconectar socket cuando el componente se desmonta
        return () => {
          newSocket.off("message");
          newSocket.disconnect();
        };
      } else {
        router.push("/auth/login");
      }
    }
  }, [router]); // El efecto se ejecuta cuando el componente se monta

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message = { sender: username, content: newMessage };
      socket.emit("message", message);
      setNewMessage("");
    }
  };

  return (
    <main>
      <Header />
      <div id="layoutSidenav">
        <Sidebar />
        <div id="layoutSidenav_content">
          <div className="container mt-5">
            <BackButton></BackButton>
            <h1>Chat en Vivo</h1>
            <div className="card">
              <div className="card-body">
                <div
                  className="chat-messages"
                  style={{ height: "300px", overflowY: "scroll" }}>
                  {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                      <strong>{message.sender}: </strong>
                      {message.content}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleSendMessage}>
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Chat;
