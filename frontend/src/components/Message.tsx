import logo from "../assets/logo.png";
import "../assets/css/Message.css";

interface MessageProps {
  text: string;
  sender: "user" | "bot";
}

const Message = ({ text, sender }: MessageProps) => {
  const isUser = sender === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "bot-row"}`}>
      {!isUser && (
        <img src={logo} alt="NETSOL Logo" className="bot-avatar-img" />
      )}
      <div className={`message-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        {text}
      </div>
    </div>
  );
};

export default Message;