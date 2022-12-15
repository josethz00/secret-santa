import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { MdOutlineClose, MdError } from "react-icons/md";
import { GiPartyPopper } from "react-icons/gi";
import toast, { Toaster } from "react-hot-toast";
import styles from "./invite.module.css";
import classNames from "classnames";
import { trpc } from "../../../utils/trpc";
import Link from "next/link";

const InvitePage: NextPage = () => {
  const router = useRouter()
  const isFirstRender = useRef(true);
  const joinGroup = trpc.auth.joinGroup.useMutation();

  const groupId = router.query.groupId as string;
  const inviteUuid = router.query.inviteUuid as string;

  const notify = (type: 'error' | 'success', extraInfo?: Record<string, unknown>) =>
    toast.custom(
      (t) => (
        type === 'success' ? (
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
        ) : (
          <div
            className={classNames([
              styles.notificationWrapper,
              t.visible ? "top-0" : "-top-96",
            ])}
          >
            <div className={styles.iconWrapper}>
              <MdError color="red" />
            </div>
            <div className={styles.contentWrapper}>
              <h1>Cannot join group, something went wrong</h1>
              <p>
                {extraInfo?.message}
              </p>
            </div>
            <div className={styles.closeIcon} onClick={() => toast.dismiss(t.id)}>
              <MdOutlineClose />
            </div>
          </div>
        )
      ),
      { id: "unique-notification", position: "top-center", duration: 6000 }
    );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    joinGroup.mutateAsync({groupId, inviteUuid}).then((res) => {
      if (res.userNotRegistered) {
        router.push('/api/auth/signin')
      }
      else if (res.success) {
        notify('success')
      }
    }).catch((err) => {
      notify('error', err);
    });
  }, [groupId, inviteUuid, router])

  return (
    <>
      <Toaster />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Invite Page
          </h1>
        </div>
      </main>
    </>
  );
};

export default InvitePage;