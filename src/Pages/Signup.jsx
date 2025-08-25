import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "../components/Loading";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username,setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(auth.currentUser?.email);

  const handleSignup = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      alert("Passwords do not match");
    }else if(username.includes(' ')){
      alert("Username can't contain spaces");
    }else{
      try {
        setLoading(true)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users",userCredential.user.uid), {
          userName: username,
          userEmail: email,
        });
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        setLoading(false)
        alert("Signup successful!");
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setLoading(false)
        alert(err.message);
        console.error(err);
      }
    }
  };
  return ( 
    loading ? <Loading/> :
    <div className="flex flex-col items-center justify-center bg-white min-h-[100vh]">
      {/* {showError?<span style={{visibility: !showError&&'hidden'}} className=" text-md text-center italic text-red-800">{backendResponse}</span>:showSuccess?
      <span style={{visibility: !showSuccess&&'hidden'}} className="text-center italic text-green-800">{backendResponse}</span>:' '} */}
      <form onSubmit={handleSignup} className="mt-[5px] flex flex-col gap-[5px] px-[30px] py-[40px] bg-white shadow-[-1px_0px_6px_1px_rgba(0,_0,_0,_0.1)] rounded-2xl w-[300px]">
        <h1 className="text-center font-bold text-2xl mb-[20px]">Signup</h1>
        <label>Your Email: </label>
        <input required value={email} onChange={(e)=>setEmail(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="email" placeholder="Enter your email"/>
        <label>Your Username: </label>
        <input maxLength={20} value={username} onChange={(e)=>setUsername(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="text" placeholder="Enter your username" required/>
        <label>Your Password: </label>
        <input required value={password} onChange={(e)=>setPassword(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="password" placeholder="Enter your password"/>
        <label>Re-Type Password: </label>
        <input required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="password" placeholder="Re-Enter your password"/>
        <button type="submit" className=" bg-green-800 text-white text-lg py-[5px] rounded-lg my-[10px]">Register</button>
        <p className="text-center">Already have account? <Link className="text-green-800 underline" to={'/login'}>Login</Link></p>
      </form>
    </div>
   );
}
 
export default Signup;