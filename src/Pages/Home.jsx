import { useEffect, useState } from "react";
import NewChat from "../components/NewChat";
import { CreateNewChatContext } from "../Contexts/CreateNewChatContext";
import { auth, db } from "../config/firebase";
import { addDoc, collection, onSnapshot, or, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const Home = () => {
  const [showAddNewChat, setShowAddNewChat] = useState(false)
  const [chats, setChats] = useState([]);
  const [chatsFinal, setChatsFinal] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');

  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unsubscribe, setUnsubscribe] = useState(null);
  const navigate = useNavigate();

  const handleSearchChats = () => {
    setTimeout(() => {
      setChatsFinal(chats.filter((chat) => chat.user1.toLowerCase().includes(searchText.toLowerCase()) || chat.user2.toLowerCase().includes(searchText.toLocaleLowerCase())))
    }, 1000)
  }

  const startListening = (chatId, chatName) => {
    // prevent multiple listeners
    setFetchingMessages(true);
    /* if (unsubscribe) return; */

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
      setFetchingMessages(false);
      setCurrentChat({ chatId, chatName });
    });

    setUnsubscribe(() => unsub);
  };
  const stopListening = () => {
    setCurrentChat(null);
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
  };
  const handleChatClick = (chatId, chatName) => {
    stopListening();
    startListening(chatId, chatName)
  }
  const handleSendMessage = async (chatId) => {
    if (message.trim().length == 0) {
      alert("empty messages not supported!");
    }
    try {
      setSendingMessage(true)
      await addDoc(collection(db, "messages"), {
        chatId: chatId,
        sender: auth.currentUser.displayName,
        receiver: currentChat,
        body: message,
        createdAt: serverTimestamp(),
      });
      setMessage('');
    } catch (err) {
      alert("An error occured");
      console.error("Error adding document:", err);
    } finally {
      setSendingMessage(false);
    }
  }
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Try again.");
    }
  };

  useEffect(() => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, or(where("user1", "==", auth.currentUser.displayName), where("user2", "==", auth.currentUser.displayName)));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
      setChatsFinal(chatsData);
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="self-center h-[100vh] w-[100vw] max-w-[1400px] bg-gradient-to-br from-green-50 via-white to-green-100 px-8 py-6 relative">
      {/* Header Section */}
      <section className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
          iBen Messenger
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 text-white bg-green-800 hover:bg-green-900 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
      </section>

      {/* Main Chat Section */}
      <section className="flex gap-4 h-[calc(100vh-100px)]">
        {/* Sidebar - Chat List */}
        <div className="w-[30%] min-w-[320px] rounded-3xl bg-white/90 backdrop-blur-sm h-full p-5 shadow-xl border border-green-100 relative flex flex-col">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Chats
          </h2>

          {/* Search Input */}
          <input
            onKeyUp={handleSearchChats}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="Search conversations..."
            className="w-full mb-4 py-3 px-5 rounded-xl border-2 border-green-600 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400 text-sm"
          />

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {
              chatsFinal.length == 0 ?
                <p className="text-center text-gray-500 italic mt-8">No chats available</p>
                : chatsFinal.map((chat) => {
                  const thisChatName = chat.user1 !== auth.currentUser.displayName ? chat.user1 : chat.user2;
                  return (
                    <div
                      style={{
                        backgroundColor: thisChatName == currentChat?.chatName ? "rgba(34, 197, 94, 0.15)" : "transparent"
                      }}
                      onClick={() => handleChatClick(chat.id, thisChatName)}
                      key={chat.id}
                      className="rounded-2xl py-3 px-4 cursor-pointer transition-all duration-200 hover:bg-green-50 border-2 border-transparent hover:border-green-200 hover:shadow-md"
                    >
                      <h3 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-user-circle text-lg"></i>
                        {thisChatName}
                      </h3>
                      <p className="text-xs text-gray-600">Chat with {thisChatName}</p>
                    </div>
                  )
                })
            }
          </div>

          {/* Add New Chat Button */}
          <button
            onClick={() => setShowAddNewChat(true)}
            className="absolute bottom-6 right-6 bg-green-800 hover:bg-green-900 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-4xl w-14 h-14 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            +
          </button>
        </div>

        {/* Main Chat Area */}
        <div
          className="flex flex-col w-full rounded-3xl bg-white/90 backdrop-blur-sm h-full shadow-xl border border-green-100 relative overflow-hidden"
        >
          {/* Loading Spinner */}
          {fetchingMessages && (
            <div className="flex justify-center items-center h-full">
              <span className="w-16 h-16 border-4 border-gray-200 border-t-green-700 animate-spin rounded-full"></span>
            </div>
          )}

          {/* Empty State */}
          {!currentChat && !fetchingMessages && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <i className="fa-solid fa-comments text-6xl text-green-200 mb-4"></i>
                <h2 className="text-2xl font-bold text-gray-400 italic">Select a chat to start messaging</h2>
              </div>
            </div>
          )}

          {/* Chat Header */}
          {currentChat && (
            <section className="bg-green-800 p-4 shadow-lg">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-circle"></i>
                {currentChat.chatName}
              </h2>
            </section>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            {
              messages.length == 0 && currentChat ?
                <p className="italic text-center text-gray-400 mt-8">No messages yet. Start the conversation!</p>
                : messages.map((message, index) => {
                  const isCurrentUser = message.sender == auth.currentUser.displayName;
                  return (
                    <div
                      key={index}
                      style={{ alignSelf: isCurrentUser ? "flex-start" : "flex-end" }}
                      className="flex flex-col w-fit max-w-[70%] animate-fadeIn"
                    >
                      <span
                        className={`px-4 py-3 rounded-2xl shadow-md ${isCurrentUser
                          ? "bg-green-700 text-white rounded-tl-sm"
                          : "bg-gray-100 text-gray-800 rounded-tr-sm"
                          }`}
                      >
                        {message.body}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 mx-2">
                        {message.createdAt?.toDate().toLocaleString("en-GB")}
                      </span>
                    </div>
                  )
                })
            }
          </div>

          {/* Message Input Area */}
          {currentChat && (
            <section className="bg-white border-t-2 border-green-100 p-4 flex gap-3 shadow-lg">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentChat.chatId)}
                className="flex-1 px-5 py-3 rounded-xl border-2 border-green-600 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
                type="text"
                placeholder="Type your message..."
                autoFocus
              />
              <button
                onClick={() => handleSendMessage(currentChat.chatId)}
                className="px-6 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={sendingMessage}
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>Send
              </button>
            </section>
          )}
        </div>
      </section>

      {/* New Chat Modal */}
      <CreateNewChatContext.Provider value={{ showAddNewChat, setShowAddNewChat }}>
        {showAddNewChat && <NewChat />}
      </CreateNewChatContext.Provider>
    </div>
  );
}

export default Home;