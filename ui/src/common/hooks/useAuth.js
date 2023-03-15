import { useAuthState, anonymous } from "../auth";

const useAuth = () => {
  const [auth, setAuth] = useAuthState();

  const setAuthFromToken = (user) => {
    if (!user) {
      setAuth(anonymous);
    } else {
      setAuth(user);
    }
  };

  return [auth, setAuthFromToken];
};

export default useAuth;
