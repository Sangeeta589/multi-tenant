import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  MenuItem,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import SearchIcon from "@mui/icons-material/Search";

const socket = io("http://localhost:5000");

const ChatContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 20,
  right: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  boxShadow: theme.shadows[5],
  zIndex: 1300,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  fontWeight: "bold",
}));

const ChatBody = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f5f5f5",
}));

const ChatFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#fff",
}));

const ChatMessage = ({ msg, currentUser }) => {
  const isUser = msg.sender === currentUser;

  return (
    <Box display="flex" justifyContent={isUser ? "flex-end" : "flex-start"} mb={1}>
      <Box display="flex" flexDirection="column" alignItems={isUser ? "flex-end" : "flex-start"} maxWidth="80%">
        <Box display="flex" alignItems="center" mb={0.5}>
          {!isUser && <Avatar sx={{ width: 24, height: 24, mr: 1 }} />}
          <Typography variant="body2" fontWeight="bold" color={isUser ? "primary" : "textPrimary"}>
            {isUser
              ? "You"
              : msg.sender === "pdt@gmail.com"
              ? "Admin"
              : msg.sender.split("@")[0]}
          </Typography>
        </Box>
        <Paper elevation={1} sx={{ px: 1.5, py: 1, backgroundColor: isUser ? "#e3f2fd" : "#fff" }}>
          <Typography variant="body2">{msg.text}</Typography>
        </Paper>
        <Typography variant="caption" color="textSecondary">
          {msg.timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

const ChatWindow = ({ isAdmin = false, userList = [] }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef(null);
  const currentUserEmail = localStorage.getItem("email") || "pdt@gmail.com";

  const handleClearChat = () => {
    const chatKey = [currentUserEmail, selectedUser || "pdt@gmail.com"].sort().join("_");
    localStorage.removeItem(chatKey);
    setMessages([]);
  };

  useEffect(() => {
    if (isAdmin && userList.length > 0 && !selectedUser) {
      setSelectedUser(userList[0]);
    }
  }, [userList, isAdmin]);

  useEffect(() => {
    socket.emit("join_room", currentUserEmail);

    socket.on("receive_message", (data) => {
      const chatKey = [data.sender, data.receiver].sort().join("_");
      const updatedMessages = [...(JSON.parse(localStorage.getItem(chatKey)) || []), data];
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      if (
        (isAdmin && (selectedUser === data.sender || selectedUser === data.receiver)) ||
        (!isAdmin && (data.sender === "pdt@gmail.com" || data.receiver === "pdt@gmail.com"))
      ) {
        setMessages(updatedMessages);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedUser]);

  useEffect(() => {
    const chatKey = [currentUserEmail, selectedUser || "pdt@gmail.com"].sort().join("_");
    const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    setMessages(savedMessages);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!msg.trim()) return;

    const timestamp = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const receiver = isAdmin ? selectedUser : "pdt@gmail.com";
    const messageData = {
      sender: currentUserEmail,
      receiver,
      text: msg,
      timestamp,
    };

    socket.emit("send_message", messageData);
    setMsg("");
  };

  if (isClosed || (!selectedUser && isAdmin)) return null;

  return (
    <ChatContainer sx={{ width: isMaximized ? 500 : 350, height: isMinimized ? 60 : isMaximized ? 600 : 450 }}>
      <ChatHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1">ChatBox</Typography>

          {isAdmin && (
            <Tooltip title="Search User">
              <IconButton
                size="small"
                onClick={() => setShowSearch((prev) => !prev)}
                sx={{ color: "#fff" }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box>
          <Tooltip title="Clear Chat">
            <IconButton size="small" onClick={handleClearChat}>
              <DeleteIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Minimize">
            <IconButton size="small" onClick={() => setIsMinimized((prev) => !prev)}>
              <MinimizeIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Maximize">
            <IconButton size="small" onClick={() => setIsMaximized((prev) => !prev)}>
              <CropSquareIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton size="small" onClick={() => setIsClosed(true)}>
              <CloseIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </ChatHeader>

      {/* User Search Input */}
      {isAdmin && showSearch && (
        <Box sx={{ p: 1, backgroundColor: "#fff" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
             onKeyDown={(e) => {
  if (e.key === "Enter" && searchTerm.trim()) {
    const userMatch = userList.find((u) =>
      u.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (userMatch) {
      setSelectedUser(userMatch);
      setSearchTerm("");
      setShowSearch(false);
    }
  }
}}

          />
          <Box mt={1} maxHeight={150} overflow="auto">
            {searchTerm.trim() !== "" &&
  userList
    .filter((user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((user) => (
      <MenuItem
        key={user}
        onClick={() => {
          setSelectedUser(user);
          setSearchTerm("");
          setShowSearch(false);
        }}
      >
        {user.split("@")[0]}
      </MenuItem>
    ))}

          </Box>
        </Box>
      )}

      {!isMinimized && (
        <>
          <ChatBody>
            {messages.map((msg, index) => (
              <ChatMessage key={index} msg={msg} currentUser={currentUserEmail} />
            ))}
            <div ref={messagesEndRef} />
          </ChatBody>

          <ChatFooter>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </ChatFooter>
        </>
      )}
    </ChatContainer>
  );
};

export default ChatWindow;
