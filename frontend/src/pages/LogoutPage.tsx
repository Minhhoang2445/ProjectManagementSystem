import Logout from "@/components/Logout";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { toast } from "sonner";
const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);

  const handleOnClick = async () => {
    try{
     await api.get("/user/test", {
      withCredentials: true,
    });
    toast.success("Test thành công");
    }catch(error){  
      console.log(error);
      toast.error("Test thất bại");
    }
  }
  return (
    <div>
      {user?.email}
      <Logout />
      <button onClick={handleOnClick}>Test</button>
    </div>
  );
};

export default ChatAppPage;
