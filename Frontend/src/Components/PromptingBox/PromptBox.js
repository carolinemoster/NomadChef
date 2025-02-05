
import { useState } from "react";
import { Send } from "lucide-react";
import './PromptBox.css';

const AIPromptBox = ({ onSubmit }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    
        <div className="glassmorphic-box">
            <input
                type="text"
                placeholder="Begin Generating Recipe..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
        <button className="send-button" onClick={handleSend}>
          <Send />
        </button>
      </div>
    
  );
};

export default AIPromptBox;