//DESCRIPTION: Show who is in list and add members by username


import {useState} from "react";
import {useAuth} from "./AuthContext";
import {addMemberByUsername} from "./ListService"; 


 // props from collabtodo, 
//      if new member is added -> snapShot listens then the list is updated and rendered in collabtodo
//      this function just receives the list, no fetching
export default function ListMembers ({list, names = {}}) {
    const {user} = useAuth(); 

    //create states
    const [username, setUsername] = useState(""); 
    const [error, setError] = useState("");

    const [success, setSuccess] = useState(""); //for confimration message  
    const [submitting, setSubmitting] = useState(false); // takes care of no multiple submits and feedback to user
    const isOwner = list?.ownerId === user?.uid;


    const handleAdd= async(e) => {
        e.preventDefault();
        //clear messages
        setError(""); 
        setSuccess("");

        if (!username.trim()) return;  //checker, enforce username

        //enables the submit btn
        setSubmitting(true);

        //add memeber using the func from listservice and passing the necessary prop from parent
        try {
            await addMemberByUsername(list.id, username) 

            setSuccess(`Successfully added username: ${username.trim()} to the group list`);
            setUsername(""); //clear username 
            
        } catch(err){
            setError(err.message ) 
        } finally {
            setSubmitting(false); //enable submit btn again
        }




    };


    return (
        <div className="bg-[#8c4362]/60 rounded-2xl p-4 flex flex-col gap-3">
            {/* show total  */}

            <h2 className="text-white font-bold">  Total Members: {list?.memberIds?.length || 0}  </h2> 
            <MembersList list={list} user={user} names={names} />                {/* form  */}
    
                {isOwner && (
                    <>
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Add by username"
                                className="flex-1 px-3 py-2 rounded-lg bg-pink-50 text-gray-900 text-sm outline-none"
                            />
                            <button
                                type="submit" 
                                disabled={submitting}
                                className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-60"

                            >
                                {submitting ? "Adding..." : "Add"}
                            </button>
                        </form>

                        {error && <p className="text-pink-100 text-sm font-semibold">{error}</p>}
                        {success && <p className="text-green-200 text-sm font-semibold">{success}</p>}

                    </>
                )}






        </div>

    );
}



//helper function for building member list


function MembersList({ list, user, names = {} }) {

    const memberElements = [];

    //loop

    if (list?.memberIds){
        for (let i = 0; i < list.memberIds.length; i++) {
            const uid = list.memberIds[i];

            //check if u is owner of list 
            const isListOwner = uid === list.ownerId; 
            //check if the row matches ur uid
            const isMe = uid === user?.uid; 

            const rawName = names[uid];
            const username = rawName ? `@${rawName}` : null;        
            let label = "";

            if (isMe) { //first check if match row
                const uname = username ? ` (${username})` : "";

                label = isListOwner ? `You${uname} - Owner` : `You${uname}`;
            } else if (isListOwner) {
                label = `${username || `Member ${uid.slice(0, 6)}...`} (Owner)`;
            } else {
                label = username || `Member ${uid.slice(0, 6)}...`;
            }

            memberElements.push(
                <li key={uid}>
                    {label}
                </li>
            );
        }
    }
    //render
    return (
        <ul className="flex flex-col gap-1 text-sm text-pink-100">
            {memberElements}
        </ul>
    );
}