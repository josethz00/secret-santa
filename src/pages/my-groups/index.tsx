import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";

const MyGroups: NextPage = () => {
  const { data: groups } = trpc.auth.getUserGroups.useQuery();
  const { data: sessionData } = useSession();

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
            Welcome, {sessionData?.user?.name}!
          </p>
          <p
            className="flex max-w-xs flex-col gap-4 p-4 text-white font-bold text-2xl hover:bg-white/20"
          >
            Here are your groups:
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {groups?.map((group) => (
            <div
              key={group.id}
              className="flex max-w-xl flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 w-full"
            >
              <p>{group.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MyGroups;