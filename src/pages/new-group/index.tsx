import type { NextPage } from "next";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import classNames from "classnames";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineClose } from "react-icons/md";
import { GiPartyPopper } from "react-icons/gi";
import styles from "./new-group.module.css";
import Link from "next/link";

const NewGroup: NextPage = () => {
  const [groupName, setGroupName] = useState<string>("");
  const [emails, setEmails] = useState<string[]>([]);
  const [email, setCurrentEmail] = useState<string>("");
  const createGroup = trpc.auth.createGroup.useMutation();

  const notify = () =>
  toast.custom(
    (t) => (
      <div
        className={classNames([
          styles.notificationWrapper,
          t.visible ? "top-0" : "-top-96",
        ])}
      >
        <div className={styles.iconWrapper}>
          <GiPartyPopper />
        </div>
        <div className={styles.contentWrapper}>
          <h1>Your new group was created!</h1>
          <p>
            You can now access your group at <b><Link href='/my-groups'>My Groups</Link></b> page. As soon as your friends join your group, you will be able to start the secret santa!
          </p>
        </div>
        <div className={styles.closeIcon} onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: "unique-notification", position: "top-center", duration: 6000 }
  );

  return (
    <main className="flex min-h-screen flex-row items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] divide-x">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Secret <span className="text-[hsl(280,100%,70%)]">Santa</span> App 🎅
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <p
            className="flex max-w-xs flex-col gap-4 p-4 text-white font-bold text-2xl hover:bg-white/20"
          >
            What is your group name?
          </p>
          <input
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <input 
            type="email" 
            className="flex max-w-xl flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setCurrentEmail(e.target.value)}
          />
          <button
            className="flex max-w-xl flex-col gap-1 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 font-bold w-full"
            onClick={() => {
              setEmails([...emails, email]);
              setCurrentEmail("");
            }}
          >
            Add email
          </button>
        </div>
        <button
          className="flex max-w-xl flex-col gap-1 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 font-bold w-full"
          onClick={() => {
            createGroup.mutateAsync({
              name: groupName,
              emails,
            }).then(() => {
              notify();
            }).catch((err) => {
              console.log(err);
            });
            setEmails([]);
          }}
        >
            Create group ✔️
        </button>
        <Toaster />
      </div>      

      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Emails
        </h1>
        <div className="flex flex-col gap-4 overflow-y-auto h-96 w-96
          overflow-x-hidden custom-scrollbar-w 
          custom-scrollbar-tr custom-scrollbar-hov custom-scrollbar-handle"
        >
          {emails.map((email) => (
            <p
              key={email}
              className="flex max-w-xs flex-col gap-4 p-1 text-white font-light text-xl"
            >
              {email}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
};

export default NewGroup;