import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    return navigate("/log-in");
  }, [navigate]);

  return <div>Sign out successful</div>;
}
