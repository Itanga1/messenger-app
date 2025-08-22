import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("logged in successfully");
    } catch (err) {
      alert(err.message);
    }
  };
  console.log(auth.currentUser?.email);

  return ( 
    <div className="flex items-center justify-center bg-white min-h-[100vh]">
      <form onSubmit={handleLogin} className="flex flex-col gap-[5px] px-[30px] py-[40px] bg-white shadow-[-1px_0px_6px_1px_rgba(0,_0,_0,_0.1)] rounded-2xl w-[300px]">
        <h1 className="text-center font-bold text-2xl mb-[20px]">Login</h1>
        <label>Email: </label>
        <input required onChange={(e)=>setEmail(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="email" placeholder="Enter your email"/>
        <label>Password: </label>
        <input required onChange={(e)=>setPassword(e.target.value)} className="px-[20px] py-[5px] border-2 border-green-800 rounded-lg" type="password" placeholder="Enter your password"/>
        <button type="submit" className=" bg-green-800 text-white text-lg py-[5px] rounded-lg my-[10px]">Login</button>
        <p className="text-center">Don't have account? <Link className="text-green-800 underline" to={'/signup'}>Signup</Link></p>
      </form>
    </div>
   );
}
 
export default Login;