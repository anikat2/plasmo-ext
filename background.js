import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import browser from 'webextension-polyfill';
console.log('browser.declarativeNetRequest:', browser.declarativeNetRequest);

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

const applyBlockingRules = async (userEmail) => {
  const docRef = doc(db, "Users", userEmail);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const blockedSites = docSnap.data().blocked || [];
    const rules = blockedSites.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: domain, resourceTypes: ["main_frame"] }
    }));

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: rules.map((rule) => rule.id),
        addRules: rules
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to apply rules:", chrome.runtime.lastError);
        } else {
          console.log("Blocking rules applied successfully");
        }
      }
    );
  }
};

// Listen for messages from popup.jsx
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "APPLY_RULES" && message.userEmail) {
    applyBlockingRules(message.userEmail);
  }
});
