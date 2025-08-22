import { useState } from "react";
import NewChat from "../components/NewChat";
import { CreateNewChatContext } from "../Contexts/CreateNewChatContext";

const Home = () => {
  const [showAddNewChat, setShowAddNewChat] = useState(false)
  const chats = [
    {
      id: 1,
      user1Username: "Pacifique123",
      user2Username: "Itanga_Benigne",
      lastMessage: "This is the last message sent"
    },
    {
      id: 2,
      user1Username: "Itanga_Benigne",
      user2Username: "Pacifique123",
      lastMessage: "This is the last message sent"
    },
    {
      id: 3,
      user1Username: "Pacifique123",
      user2Username: "Itanga_Benigne",
      lastMessage: "This is the last message sent"
    }
  ]
  return ( 
    <div className="self-center h-[100vh] w-[100vw] max-w-[1200px] bg-[whitesmoke] p-[50px] relative">
      <section>
        <h1 className="text-green-800 font-bold text-2xl">iBen Messenger</h1>
      </section>
      <hr />
      <section className="bg-white flex">
        <div className="w-[30%] min-w-[300px] rounded-2xl bg-white h-[calc(100vh-90px)] p-[10px] shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] relative mr-[10px]">
          <h1 className="text-green-800 font-bold text-lg">Chats</h1>
          <input type="text" placeholder="Type here to search" className=" w-full my-[20px] py-[5px] px-[20px] rounded-2xl shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] text-sm"/>
          {
            chats.map((chat)=>{
              return (
                <div key={chat.id} className=" shadow-[0px_0px_5px_1px_rgba(0,_0,_0,_0.1)] rounded-3xl py-[5px] px-[15px] mb-[5px]">
                  <h2 className="text-sm text-green-800">{chat.user1Username}</h2>
                  <p className="text-sm italic ">{chat.lastMessage.length > 30 ? chat.lastMessage.slice(0,30)+'.....' : chat.lastMessage}</p>
                </div>
              )
            })
          }
          <button onClick={()=>setShowAddNewChat(true)} className=" flex justify-center items-center absolute bottom-[20px] right-[20px] bg-green-800 text-white rounded-4xl px-[15px] py-[2px] cursor-pointer hover:shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">+ New chat</button>
        </div>
        <div className="flex items-center justify-center w-full rounded-2xl bg-white h-[calc(100vh-90px)] p-[10px] shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] relative">
          <h1 className="italic font bold">No chat selected</h1>
        </div>
      </section>
      <CreateNewChatContext.Provider value={{showAddNewChat, setShowAddNewChat}}>
        {showAddNewChat ?<NewChat />:''}
      </CreateNewChatContext.Provider>
    </div>
   );
}
 
export default Home;