import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiCheck } from 'react-icons/fi';
import { trpc } from "../../utils/trpc";

const Profile: NextPage = () => {
  const { data: sessionData } = useSession();
  const [nameDisabled, setNameDisabled] = useState(true);
  const [bioDisabled, setBioDisabled] = useState(true);
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const updateBio = trpc.auth.updateBio.useMutation();
  const updateName = trpc.auth.updateName.useMutation();
  const isFirstRender = useRef(true);

  const handleBioSaveClick = async () => {
    await updateBio.mutateAsync({bio});
    setBioDisabled(!bioDisabled);
  }

  const handleNameSaveClick = async () => {
    await updateName.mutateAsync({name});
    setNameDisabled(!nameDisabled);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setName(sessionData?.user?.name || '');
    setBio(sessionData?.user?.bio ?? '');
  }, [sessionData])
  
  return (
    <main className="flex min-h-screen flex-row items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] divide-x">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Profile
        </h1>
        <div>
          <p className="text-white font-bold text-2xl mb-4 ml-2">Name</p>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={name}
              disabled={nameDisabled}
              onChange={(e) => setName(e.target.value)}
              className={
                nameDisabled ?
                  "flex max-w-xs flex-col gap-4 p-2 text-white font-bold text-xl rounded-xl"
                    :
                  "flex max-w-xs flex-col gap-4 p-2 text-gray font-bold text-xl rounded-xl"
              }
            />
            {nameDisabled ? 
              <div className="p-2 bg-white/20 rounded-xl w-16 flex items-center justify-center">
                <FiEdit2 onClick={() => setNameDisabled(!nameDisabled)} color='#f5f5f5' size={30} cursor='pointer' />
              </div>
                : 
              <div className="p-2 bg-white/20 rounded-xl w-16 flex items-center justify-center">
                <FiCheck onClick={handleNameSaveClick} color='#f5f5f5' size={30} cursor='pointer' />
              </div>
            }
          </div>
        </div>
        <div>
          <p className="text-white font-bold text-2xl mb-4 ml-2">Bio</p>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={bio}
              disabled={bioDisabled}
              onChange={(e) => setBio(e.target.value)}
              className={
                bioDisabled ?
                  "flex max-w-xs flex-col gap-4 p-2 text-white font-bold text-xl rounded-xl"
                    :
                  "flex max-w-xs flex-col gap-4 p-2 text-gray font-bold text-xl rounded-xl"
              }
            />
            {bioDisabled ? 
              <div className="p-2 bg-white/20 rounded-xl w-16 flex items-center justify-center">
                <FiEdit2 onClick={() => setBioDisabled(!bioDisabled)} color='#f5f5f5' size={30} cursor='pointer' />
              </div>
                : 
              <div className="p-2 bg-white/20 rounded-xl w-16 flex items-center justify-center">
                <FiCheck onClick={handleBioSaveClick} color='#f5f5f5' size={30} cursor='pointer' />
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;