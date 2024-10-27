import { AuthProvider, withAuthInfo } from "@propelauth/react";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { chrome } from 'webextension-polyfill';

const firebaseConfig = {
  apiKey: "AIzaSyA1F1mf_rXzLYek_Zpt3Mu44ZNynoAYBRQ",
  authDomain: "lockedin-8f18f.firebaseapp.com",
  projectId: "lockedin-8f18f",
  storageBucket: "lockedin-8f18f.appspot.com",
  messagingSenderId: "1086827032088",
  appId: "1:1086827032088:web:e6bdf0af9b56b7f0f09d6d",
  measurementId: "G-C2QB579VEQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const YourApp = withAuthInfo((props) => {
  const [blockedSites, setBlockedSites] = useState([]);

  const fetchBlockedSites = async () => {
    console.log("Fetching blocked sites...");
    if (props.isLoggedIn && props.user) {
      const docRef = doc(db, "Users", props.user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const sites = docSnap.data().blocked || [];
        setBlockedSites(sites);

        // Send message to background.js to apply blocking rules
        chrome.runtime.sendMessage({ type: "APPLY_RULES", userEmail: props.user.email });
      } else {
        console.log("No such document!");
      }
    }
  };

  useEffect(() => {
    fetchBlockedSites();
  }, [props.isLoggedIn, props.user]);

  return (
    <div>
      {props.isLoggedIn && props.user ? (
        <div>
          <p>You are logged in as {props.user.email}</p>
          <p>Blocked Sites: {blockedSites.join(', ')}</p>
        </div>
      ) : (
        <p>You are not logged in</p>
      )}
    </div>
  );
});

export default function RootLayout({ children }) {
  return (
    <AuthProvider authUrl="https://59327857363.propelauthtest.com">
      <YourApp />
      {children}
    </AuthProvider>
  );
}
