import { useContext, useEffect, useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import { CreateNewChatContext } from "../Contexts/CreateNewChatContext";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import Loading from "./Loading";

const NewChat = () => {
  const { showAddNewChat, setShowAddNewChat } = useContext(CreateNewChatContext);
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
      const currentUser = fetchedUsers.find(user => user.id == auth.currentUser.uid);
      setLoading(false)
      setCurrentUserName(currentUser.userName);
    } catch (e) {
      setLoading(false);
      alert("Error fetching users");
      console.error("Error fetching users:", e);
    }
  };
  const handleSearch = (e) => {
    setTimeout(() => {
      setUsersFinal(users.filter((user) => {
        return user.userName.toLowerCase().includes(e.target.value.toLowerCase().trim());
      }))
    }, 1000)
  }
  const handleCreateChat = async (id, userName) => {
    try {
      // Check both possible chat IDs (currentUser-otherUser and otherUser-currentUser)
      const customId1 = auth.currentUser.uid + "-" + id;
      const customId2 = id + "-" + auth.currentUser.uid;

      const chatRef1 = doc(db, "chats", customId1);
      const chatRef2 = doc(db, "chats", customId2);

      const [docSnap1, docSnap2] = await Promise.all([
        getDoc(chatRef1),
        getDoc(chatRef2)
      ]);

      // If either chat exists, show alert
      if (docSnap1.exists() || docSnap2.exists()) {
        alert("Chat already exists with this user!");
        return;
      }

      // Create new chat using the first ID format
      await setDoc(chatRef1, {
        user1: currentUserName,
        user2: userName
      });

      alert("Chat created successfully!");
      setShowAddNewChat(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to create chat. Please try again.");
    }
  }
  useEffect(() => {
    getUsers();
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex justify-center items-center bg-green-900/40 backdrop-blur-md">
      <ClickAwayListener onClickAway={() => setShowAddNewChat(false)}>
        <div className="bg-white/95 backdrop-blur-sm h-[80vh] w-[420px] rounded-3xl p-6 shadow-2xl border border-green-100 flex flex-col">
          {/* Header */}
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Start New Chat
          </h2>

          {/* Search Input */}
          <input
            onKeyUp={handleSearch}
            autoFocus
            type="text"
            placeholder="Search users..."
            className="w-full mb-6 py-3 px-5 rounded-xl border-2 border-green-600 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400 text-sm"
          />

          {/* Users List */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-2">Available Users</h3>

            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="w-12 h-12 border-4 border-gray-200 border-t-green-700 animate-spin rounded-full"></span>
              </div>
            ) : usersFinal.length > 0 ? (
              usersFinal.map((user) => {
                return user.id !== auth.currentUser.uid && (
                  <div
                    key={user.id}
                    onClick={() => handleCreateChat(user.id, user.userName)}
                    className="rounded-xl py-3 px-4 border-2 border-green-200 hover:border-green-600 hover:bg-green-800 hover:text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <i className="fa-solid fa-user"></i>
                      @{user.userName}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400 italic mt-8">No users found</p>
            )}
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
}

export default NewChat;