import { useEffect, useRef } from "react";
import Message from "./Message";
import "../assets/css/ChatWindow.css";

export interface ChatMessage {
  text: string;
  sender: "user" | "bot";
}

interface ChatWindowProps {
  messages: ChatMessage[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} sender={msg.sender} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;