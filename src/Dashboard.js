import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, db, logout } from "./firebase";
import { collection, doc, getDoc } from "firebase/firestore";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function UserData({ uid }) {
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    const userDocRef = doc(db, "users", uid);
    const userDocSnapshot = await getDoc(userDocRef);
    setUserData(userDocSnapshot.data());
  };

  const debouncedFetchUserData = debounce(fetchUserData, 500);

  useEffect(() => {
    debouncedFetchUserData();
  }, [debouncedFetchUserData]);

  return (
    <div>
      {userData ? (
        <div>
          <h2>User Data</h2>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Fetches the user's name from Firestore
  const fetchUserName = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data();
      setName(userData.name);
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching user data");
    }
  };

  useEffect(() => {
    // If the user is not logged in, redirect to the login page
    if (!user) {
      navigate("/");
      return;
    }

    // Fetch the user's name from Firestore
    fetchUserName();
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {/* Display the user's name and email */}
        Logged in as <div>{name}</div>
        <div>{user?.email}</div>

        {/* Show an error message if there's an error fetching the user's data */}
        {error && <div>Error fetching user data</div>}

        {/* Logout button */}
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Display the user's data from Firestore */}
      <UserData uid={user?.uid} />
    </div>
  );
}

export default Dashboard;
