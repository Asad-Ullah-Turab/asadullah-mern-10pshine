import { useContext } from "react";
import UserContext from "../../store/UserContext";

function Home() {
  const { user, loading, isAuthenticated } = useContext(UserContext);

  return (
    <div>
      {loading ? (
        <div>Loading ...</div>
      ) : isAuthenticated() ? (
        <div>
          <p>Welcome {user?.name}</p>
          <p> Your email is {user?.email}</p>
        </div>
      ) : (
        <div>User Not authenticated</div>
      )}
    </div>
  );
}

export default Home;
