import { useAuthState, anonymous } from "../auth";

export default function useAuth() {
  const [auth, setAuth] = useAuthState();

  const setAuthFromToken = (user) => {
    if (!user) {
      setAuth(anonymous);
    } else {
      setAuth(user);
    }
  };

  return [auth, setAuthFromToken];
}
