import { useContext, useEffect, useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import { CreateNewChatContext } from "../Contexts/CreateNewChatContext";
import { collection, getDocs, setDoc, doc, getDoc} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import Loading from "./Loading";

const NewChat = () => {
  const {showAddNewChat, setShowAddNewChat} = useContext(CreateNewChatContext);
  const [users, setUsers] = useState([]);
  const [usersFinal, setUsersFinal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState('')
  const getUsers = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setUsers(fetchedUsers);
      setUsersFinal(fetchedUsers);
      const currentUser = fetchedUsers.find(user=>user.id == auth.currentUser.uid);
      setLoading(false)
      setCurrentUserName(currentUser.userName);
      console.log(currentUser.userName);
      /* if (currentUser) {
        setCurrentUserName(currentUser.userName);
        console.log(currentUser.userName);
      } else {
        console.warn("Current user not found in fetched users.");
      } */
    } catch (e) {
      setLoading(false);
      alert("Error fetching users");
      console.error("Error fetching users:", e);
    }
  };
  useEffect(()=>{
    getUsers();
  },[])
  return ( 
    <div style={{backgroundColor: "rgba(2, 108, 74, 0.6)"}} className=" fixed top-0 left-0 right-0 bottom-0 z-[100] flex justify-center items-center">
      <ClickAwayListener onClickAway={()=>setShowAddNewChat(false)}>
        <div style={{display: loading&&'flex', flexDirection:loading&&'column'}} className="bg-white h-[80vh] w-[300px] rounded-2xl p-[10px]">
          <input autoFocus type="text" placeholder="Type here to search users" className=" w-full my-[20px] py-[5px] px-[20px] rounded-2xl shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)] text-sm"/>
          <h1 className="font-bold text-md">All users</h1>
          <div style={{alignItems: loading&&'center'}} className=" flex flex-col gap-[5px] mt-[10px]">
            {
              users.length>0 && users.map((user)=>{
                return <span className="rounded py-[5px] px-[10px] shadow-[0px_0px_5px_1px_rgba(0,_0,_0,_0.1)] hover:bg-green-800 hover:text-white cursor-pointer active:opacity-[0.8]">@{user.userName}</span>
              })
            }
            {loading && <span className=" w-[50px] h-[50px] border-[3px] border-gray-300 border-t-green-800 animate-spin rounded-full"></span>}
          </div>
        </div>
      </ClickAwayListener>
    </div>
   );
}
 
export default NewChat;