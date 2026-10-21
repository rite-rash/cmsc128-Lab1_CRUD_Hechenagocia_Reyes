// THROWAWAY PAGE: delete before submitting.
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  addMemberByUsername,
  createList,
  useMyLists,
} from "./listService";

export default function TestLists() {
  const { user } = useAuth();
  const { lists, loading } = useMyLists();

  const [newName, setNewName] = useState("");
  const [inviteInputs, setInviteInputs] = useState({}); // listId -> username
  const [log, setLog] = useState([]);

  // access test inputs
  const [probeId, setProbeId] = useState("");
  const [probeUsername, setProbeUsername] = useState("");

  const say = (msg) => setLog((l) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...l]);

  async function handleCreate() {
    try {
      const id = await createList(newName);
      say(`✅ Created list "${newName}" (id: ${id})`);
      setNewName("");
    } catch (e) {
      say(`❌ Create failed: ${e.code || e.message}`);
    }
  }

  async function handleInvite(listId, username) {
    try {
      await addMemberByUsername(listId, username);
      say(`✅ Added "${username}" to list ${listId}`);
    } catch (e) {
      say(`🚫 Invite failed: ${e.code || e.message}`);
    }
  }

  // TEST 2: can the current user read this list / its tasks / invite to it?
  async function probeRead() {
    if (!probeId.trim()) return;
    const id = probeId.trim();
    try {
      const snap = await getDoc(doc(db, "lists", id));
      if (snap.exists()) {
        say(`✅ CAN read list "${snap.data().name}" | members: ${snap.data().memberIds.length}`);
      } else {
        say(`🚫 List not readable / doesn't exist`);
      }
    } catch (e) {
      say(`🚫 BLOCKED reading list: ${e.code}`);
    }
    try {
      const t = await getDocs(query(collection(db, "tasks"), where("listId", "==", id)));
      say(`✅ CAN read tasks of that list (${t.size} found)`);
    } catch (e) {
      say(`🚫 BLOCKED reading tasks: ${e.code}`);
    }
  }

  async function probeInvite() {
    if (!probeId.trim() || !probeUsername.trim()) return;
    try {
      await addMemberByUsername(probeId.trim(), probeUsername);
      say(`⚠️ Invite SUCCEEDED (fine only if you are the owner)`);
    } catch (e) {
      say(`🚫 BLOCKED inviting: ${e.code || e.message}`);
    }
  }

  const box = "border rounded p-3 mb-4";
  const input = "border rounded px-2 py-1 mr-2";
  const btn = "border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200";

  return (
    <div className="max-w-2xl mx-auto p-4 text-sm">
      <h1 className="text-xl font-bold mb-1">List access test (throwaway)</h1>
      <p className="mb-4">
        Logged in as uid: <code>{user ? user.uid : "nobody"}</code>
      </p>

      {/* Create */}
      <div className={box}>
        <h2 className="font-semibold mb-2">1. Create a list</h2>
        <input
          className={input}
          placeholder="List name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className={btn} onClick={handleCreate}>Create</button>
      </div>

      {/* My lists + invite */}
      <div className={box}>
        <h2 className="font-semibold mb-2">2. My lists (lists I am a member of)</h2>
        {loading && <p>Loading…</p>}
        {!loading && lists.length === 0 && <p>No lists yet.</p>}
        {lists.map((l) => (
          <div key={l.id} className="border-t py-2">
            <p>
              <b>{l.name}</b> {l.ownerId === user?.uid ? "(owner)" : "(member)"}
            </p>
            <p>id: <code>{l.id}</code></p>
            <p>members: {l.memberIds.length}</p>
            <input
              className={input}
              placeholder="username to invite"
              value={inviteInputs[l.id] || ""}
              onChange={(e) =>
                setInviteInputs({ ...inviteInputs, [l.id]: e.target.value })
              }
            />
            <button className={btn} onClick={() => handleInvite(l.id, inviteInputs[l.id] || "")}>
              Invite
            </button>{" "}
            <a className="underline" href={`/lists/${l.id}`}>open /lists/{l.id}</a>
          </div>
        ))}
      </div>

      {/* Probe */}
      <div className={box}>
        <h2 className="font-semibold mb-2">3. Try to access any list by id</h2>
        <p className="mb-2">Paste a listId you are NOT a member of. Everything should say BLOCKED.</p>
        <input
          className={input + " w-72"}
          placeholder="listId"
          value={probeId}
          onChange={(e) => setProbeId(e.target.value)}
        />
        <button className={btn} onClick={probeRead}>Try to read</button>
        <div className="mt-2">
          <input
            className={input}
            placeholder="username"
            value={probeUsername}
            onChange={(e) => setProbeUsername(e.target.value)}
          />
          <button className={btn} onClick={probeInvite}>Try to invite</button>
        </div>
      </div>

      {/* Log */}
      <div className={box}>
        <h2 className="font-semibold mb-2">Results</h2>
        {log.length === 0 && <p>Nothing yet.</p>}
        {log.map((line, i) => (
          <p key={i} className="font-mono text-xs">{line}</p>
        ))}
      </div>
    </div>
  );
}