import { useEffect, useState } from "react";
import NewChat from "../components/NewChat";
import { CreateNewChatContext } from "../Contexts/CreateNewChatContext";
import { auth, db } from "../config/firebase";
import { addDoc, collection, onSnapshot, or, orderBy, query, serverTimestamp, where, deleteDoc, doc } from "firebase/firestore";
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
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
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
    startListening(chatId, chatName);
    setShowSidebar(false); // Close sidebar on mobile when chat is selected
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
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteDoc(doc(db, "chats", chatId));
        // If the deleted chat is currently open, close it
        if (currentChat && currentChat.chatId === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Error deleting chat:", err);
        alert("Failed to delete chat.");
      }
    }
  };

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
    <div className="self-center h-[100vh] w-[100vw] max-w-[1400px] bg-gradient-to-br from-green-50 via-white to-green-100 px-4 md:px-8 py-4 md:py-6 relative">
      {/* Header Section */}
      <section className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-green-800 hover:bg-green-100 rounded-lg transition-all duration-300 active:scale-95"
          >
            <i className={`fa-solid ${showSidebar ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>

          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
            iBen Messenger
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 text-sm md:text-base text-white bg-green-800 hover:bg-green-900 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </section>

      {/* Main Chat Section */}
      <section className="flex flex-col md:flex-row gap-2 md:gap-4 h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] relative">
        {/* Sidebar - Chat List */}
        <div className={`
          ${showSidebar ? 'fixed inset-0 z-40 bg-black/50 md:bg-transparent' : 'hidden'}
          md:relative md:block md:bg-transparent
        `}>
          <div
            className={`
              ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
              transition-transform duration-300
              w-[80%] md:w-[30%] md:min-w-[320px] 
              rounded-3xl bg-white/90 backdrop-blur-sm 
              h-full p-4 md:p-5 
              shadow-xl border border-green-100 
              relative flex flex-col
            `}
          >
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-green-800">
                Chats
              </h2>

              {/* Close Button - Mobile Only */}
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden flex items-center justify-center w-9 h-9 text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            {/* Search Input */}
            <input
              onKeyUp={handleSearchChats}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              placeholder="Search conversations..."
              className="w-full mb-3 md:mb-4 py-2 md:py-3 px-4 md:px-5 rounded-xl border-2 border-green-600 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400 text-sm"
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
                        className="rounded-2xl py-3 px-4 cursor-pointer transition-all duration-200 hover:bg-green-50 border-2 border-transparent hover:border-green-200 hover:shadow-md flex justify-between items-center group"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
                            <i className="fa-solid fa-user-circle text-lg"></i>
                            {thisChatName}
                          </h3>
                          <p className="text-xs text-gray-600">Chat with {thisChatName}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-500 hover:bg-red-100 rounded-full"
                          title="Delete Chat"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    )
                  })
              }
            </div>

            {/* Add New Chat Button */}
            <button
              onClick={() => setShowAddNewChat(true)}
              className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-green-800 hover:bg-green-900 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-3xl md:text-4xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center hover:scale-110 active:scale-95"
            >
              +
            </button>
          </div>
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
            <section className="bg-green-800 p-3 md:p-4 shadow-lg">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-circle"></i>
                {currentChat.chatName}
              </h2>
            </section>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 flex flex-col">
            {
              messages.length == 0 && currentChat ?
                <p className="italic text-center text-gray-400 mt-8">No messages yet. Start the conversation!</p>
                : messages.map((message, index) => {
                  const isCurrentUser = message.sender == auth.currentUser.displayName;
                  return (
                    <div
                      key={index}
                      style={{ alignSelf: isCurrentUser ? "flex-start" : "flex-end" }}
                      className="flex flex-col w-fit max-w-[85%] md:max-w-[70%] animate-fadeIn"
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
            <section className="bg-white border-t-2 border-green-100 p-3 md:p-4 flex gap-2 md:gap-3 shadow-lg">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentChat.chatId)}
                className="flex-1 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-green-600 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400 text-sm md:text-base"
                type="text"
                placeholder="Type your message..."
                autoFocus
              />
              <button
                onClick={() => handleSendMessage(currentChat.chatId)}
                className="px-3 md:px-6 py-2 md:py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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