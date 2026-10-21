import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";

// Wrap a collaborative list screen with this. Only members get through;
// everyone else (non-member, missing list, no permission) goes back to "/".

// NOTE: in App.jsx, the /lists/:listId route currently renders a placeholder
// <div> inside this guard. Replace that <div> with the real collab list screen (in App.jsx).
// Keep the <ListGuard> wrapper itself.
export default function ListGuard({ children }) {
  const { listId } = useParams();
  const { user, authLoading } = useAuth();
  const uid = user?.uid;
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setStatus("checking");

    getDoc(doc(db, "lists", listId))
      .then((snap) => {
        if (cancelled) return;
        const members = snap.exists() ? snap.data().memberIds || [] : [];
        setStatus(members.includes(uid) ? "allowed" : "denied");
      })
      .catch(() => {
        // permission-denied lands here; treat it the same as "not a member"
        if (!cancelled) setStatus("denied");
      });

    return () => {
      cancelled = true;
    };
  }, [listId, uid]);

  if (authLoading) return <p className="p-4">Checking access…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (status === "checking") return <p className="p-4">Checking access…</p>;
  if (status === "denied") return <Navigate to="/" replace />;
  return children;
}