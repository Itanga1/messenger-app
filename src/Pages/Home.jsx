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

  const handleSearchChats = ()=>{
    setTimeout(()=>{
      setChatsFinal(chats.filter((chat)=>chat.user1.toLowerCase().includes(searchText.toLowerCase()) || chat.user2.toLowerCase().includes(searchText.toLocaleLowerCase())))
    },1000)
  }

  const startListening = (chatId,chatName) => {
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
      setCurrentChat({chatId, chatName});
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
  const handleChatClick = (chatId, chatName)=>{
    stopListening();
    startListening(chatId, chatName)
  }
  const handleSendMessage = async(chatId)=>{
    if(message.trim().length == 0){
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
    }finally{
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
    const q = query(chatsRef,or(where("user1", "==", auth.currentUser.displayName),where("user2", "==", auth.currentUser.displayName)));
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
    <div className="self-center h-[100vh] w-[100vw] max-w-[1200px] bg-[whitesmoke] p-[50px] relative">
      <section className="flex justify-between">
        <h1 className="text-green-800 font-bold text-2xl">iBen Messenger</h1>
        <button onClick={handleLogout} className="text-lg font-bold cursor-pointer"><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
      </section>
      <hr />
      <section className="bg-white flex">
        <div className="w-[30%] min-w-[300px] rounded-2xl bg-white h-[calc(100vh-90px)] p-[10px] shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] relative mr-[10px]">
          <h1 className="text-green-800 font-bold text-lg">Chats</h1>
          <input onKeyUp={handleSearchChats} onChange={(e)=>setSearchText(e.target.value)} type="text" placeholder="Type here to search" className=" w-full my-[20px] py-[5px] px-[20px] rounded-2xl shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] text-sm"/>
          {
            chatsFinal.length == 0? <h1 className="text-center">No chats available</h1> :chatsFinal.map((chat)=>{
              const thisChatName = chat.user1!==auth.currentUser.displayName?chat.user1 : chat.user2;
              return (
                <div style={{backgroundColor: thisChatName==currentChat?.chatName && "lightgreen"}} onClick={()=>handleChatClick(chat.id, chat.user1!==auth.currentUser.displayName?chat.user1 : chat.user2)} key={chat.id} className=" shadow-[0px_0px_5px_1px_rgba(0,_0,_0,_0.1)] rounded-3xl py-[5px] px-[15px] mb-[5px] cursor-pointer">
                  <h2 className="text-sm text-green-800 font-bold">{thisChatName}</h2>
                  <p className="text-sm italic ">Chat with {thisChatName}</p>
                </div>
              )
            })
          }
          <button onClick={()=>setShowAddNewChat(true)} className=" flex justify-center absolute bottom-[20px] right-[20px] bg-green-800 text-white rounded-full cursor-pointer hover:shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] text-5xl w-[60px] h-[60px]">+</button>
        </div>
        <div style={{justifyContent: !currentChat&&"center", alignItems: !currentChat&&"center"}} className="flex flex-col gap-[10px] w-full rounded-2xl bg-white h-[calc(100vh-90px)] px-[10px] shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] relative overflow-y-auto py-[0px]">
          {fetchingMessages && <span className="w-[60px] h-[60px] border-[3px] border-gray-300 border-t-green-800 animate-spin rounded-full"></span>}
          {!currentChat && !fetchingMessages && <h1 className="italic font bold">No chat selected</h1> }
          {currentChat && <section className="mb-auto bg-white sticky top-0 p-[10px] shadow-[0px_5px_8px_0px_rgba(0,_0,_0,_0.1)] mx-[-10px]">
            <h1 className="text-lg text-green-800 font-bold">{currentChat.chatName}</h1>
          </section>}
          {
            messages.length==0 && currentChat ? <p className="italic text-center" >No messages </p> : messages.map((message)=>{
              return(
                <div style={{alignSelf: message.sender == auth.currentUser.displayName ? "flex-start":"flex-end"}} className="flex flex-col w-fit">
                  <span style={{backgroundColor: message.sender == auth.currentUser.displayName?"green":"whitesmoke", color: message.sender == auth.currentUser.displayName?"white":"black"}} className="bg-green-800 px-[10px] py-[5px] rounded-2xl">{message.body}</span>
                  <span className="italic text-sm">{message.createdAt?.toDate().toLocaleString("en-GB")}</span>
                </div>
              )
            })
          }
          {currentChat && <section className="mt-auto gap-[5px] flex justify-center sticky bottom-0 bg-white p-[10px] mx-[-10px] shadow-[0px_-5px_8px_0px_rgba(0,_0,_0,_0.1)]">
            <input value={message} onChange={(e)=>setMessage(e.target.value)} className="px-[15px] py-[5px] w-[80%] rounded-2xl border-[3px] border-green-800 focus:outline-green-800" type="text" placeholder="Type your message" autoFocus/>
            <button onClick={()=>handleSendMessage(currentChat.chatId)} className="text-white bg-green-800 px-[20px] py-[5px] rounded-[20px] font-bold" disabled={sendingMessage}>Send</button>
          </section>}
        </div>
      </section>
      <CreateNewChatContext.Provider value={{showAddNewChat, setShowAddNewChat}}>
        {showAddNewChat ?<NewChat />:''}
      </CreateNewChatContext.Provider>
    </div>
   );
}
 
export default Home;