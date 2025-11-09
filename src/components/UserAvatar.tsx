"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";

export default function UserAvatar() {
  const { data: session, status } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPopup]);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation to parent
    if (status === "loading") return;

    if (!session) {
      // Not authenticated - initiate sign in
      signIn("google");
    } else {
      // Authenticated - toggle popup
      setShowPopup(!showPopup);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation to parent
    signOut();
    setShowPopup(false);
  };

  const isLoading = status === "loading";

  return (
    <div
      className="fixed top-4 right-4 z-[9999]"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        onClick={handleAvatarClick}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        disabled={isLoading}
        className="flex items-center justify-center rounded-full transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={session ? "User menu" : "Sign in"}
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-white shadow-lg"
            unoptimized
          />
        ) : (
          <FaUserCircle className="h-10 w-10 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Popup menu */}
      {showPopup && session && (
        <div
          ref={popupRef}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-14 right-0 mt-2 w-64 cursor-default rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800"
        >
          <div className="p-4">
            <div className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700">
              {session.user.name && (
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {session.user.name}
                </p>
              )}
              {session.user.email && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {session.user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
