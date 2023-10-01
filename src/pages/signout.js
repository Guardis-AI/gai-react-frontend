import { useNavigate } from "react-router-dom";

export default function SignOut() {
  const navigate = useNavigate;
  localStorage.clear();
  return navigate("/log-in");
}
