"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LogoutMenuButton from "./LogoutMenuButton";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { markTutorialAsViewed } from "./actions";
import { useOrderCounts } from "@/hooks/useOrderCounts";
import { setGlobalSoundEnabled } from "@/hooks/useOrderCompletedSound";

type Role = "USER" | "STAFF" | "ADMIN";

interface Item {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  items?: Item[];
}

interface Menu {
  id: string;
  name: string;
  sections: Section[];
}

interface TopBarClientProps {
  role?: Role;
  menus: Menu[];
  balance?: string | null;
  cartIcon?: React.ReactNode;
  openOrdersCount?: number;
  allOpenOrdersCount?: number;
  userId?: string;
  openMessagesCount?: number;
  tutorialViewed?: boolean;
}

const linkClassName = "px-1 py-2 rounded text-gray-900 dark:text-gray-300 no-underline text-sm font-medium block text-right pr-4";
const collapsibleClassName = "flex items-center justify-start gap-4 w-full bg-transparent border-none cursor-pointer px-1 py-2 pr-4 text-gray-900 dark:text-gray-300 text-sm font-medium";
const subCollapsibleClassName = "flex items-center justify-start gap-4 w-full bg-transparent border-none cursor-pointer px-1 py-2 pr-4 mr-8 text-gray-900 dark:text-gray-300 text-xs font-medium";
const subCollapsibleClassName1 = "flex items-center justify-start gap-4 w-full bg-transparent border-none cursor-pointer px-1 py-2 pr-4 pl-8 text-gray-900 dark:text-gray-300 text-xs font-medium";
const subLinkClassName = "px-1 py-2 rounded text-gray-900 dark:text-gray-300 no-underline text-xs font-medium block text-right pr-4 mr-8";
const subSubLinkClassName = "px-1 py-2 rounded text-gray-900 dark:text-gray-300 no-underline text-xs font-medium block text-right pr-4 mr-16";


export default function TopBarClient({ role, menus, balance, cartIcon, openOrdersCount = 0, allOpenOrdersCount = 0, userId, openMessagesCount = 0, tutorialViewed = true }: TopBarClientProps) {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [staffOpen, setStaffOpen] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [showTutorial, setShowTutorial] = useState(false);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    function onFirstInteraction() {
      setGlobalSoundEnabled(true);
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    }
    window.addEventListener("click", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);
    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  // Use the order counts hook to get dynamic badge counts
  const counts = useOrderCounts({
    userOrders: openOrdersCount,
    allOrders: allOpenOrdersCount,
  });

  // Auto-show tutorial if user hasn't viewed it yet (DB is source of truth)
  useEffect(() => {
    if (!tutorialViewed && userId) {
      setShowTutorial(true);
    }
  }, [tutorialViewed, userId]);

  // Initialize all menus as expanded when component mounts or menus change
  useEffect(() => {
    if (menus.length > 0) {
      const allExpanded = menus.reduce((acc, menu) => ({
        ...acc,
        [menu.id]: true,
      }), {});
      setExpandedMenus(allExpanded);
    }
  }, [menus]);

  function close() {
    setOpen(false);
  }

  function toggleMenuExpanded(menuId: string) {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  }

  async function handleTutorialComplete() {
    try {
      if (userId) {
        await markTutorialAsViewed(userId);
      }
      setShowTutorial(false);
    } catch (error) {
      console.error("Failed to mark tutorial as viewed:", error);
      setShowTutorial(false);
    }
  }

  async function handleTutorialSkip() {
    setShowTutorial(false);
    try {
      if (userId) {
        await markTutorialAsViewed(userId);
      }
    } catch (error) {
      console.error("Failed to mark tutorial as viewed:", error);
    }
  }

  function handleTutorialClick() {
    setShowTutorial(true);
    setOpen(false);
  }

  return (
    <>
      {showTutorial && (
        <OnboardingTutorial role={role} onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
      )}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-[61px] flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4 justify-start">
            <button
              type="button"
              aria-label="פתח תפריט"
              onClick={() => setOpen(true)}
              className="cursor-pointer p-1 flex items-center bg-transparent border-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-gray-900 dark:text-white"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link
              href="/"
              title="בית"
              className="flex items-center text-white no-underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-900 dark:text-white"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </Link>
          </div>

          {/* Title - centered */}
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white text-center m-0 flex-1">תרבות רמות מנשה</h1>

          {/* Right section */}
          <div className="flex items-center gap-4 justify-end">
            {balance && (
              <Link
                href="/wallet"
                title="הארנק שלי"
                className="text-xs font-medium text-gray-900 dark:text-gray-300 no-underline hover:opacity-80 transition"
              >
                יתרה: ₪{balance}
              </Link>
            )}
            {cartIcon}
            <button
              type="button"
              title={soundEnabled ? "השתק צליל" : "הפעל צליל"}
              onClick={() => {
                const next = !soundEnabled;
                setGlobalSoundEnabled(next);
                setSoundEnabled(next);
              }}
              className="flex items-center bg-transparent border-none cursor-pointer p-1"
            >
              {soundEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 dark:text-white">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06L19.5 10.94l-1.72-1.72z" />
                </svg>
              )}
            </button>
            <Link
              href={userId ? `/user/${userId}` : "/login"}
              title="פרופיל"
              className="flex items-center text-white no-underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-900 dark:text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/30 z-50"
        />
      )}

      {/* Slide-in panel */}
      {open && (
        <div
          className="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-51 flex flex-col p-6 overflow-y-auto"
        >
          {/* Panel header */}
          <div className="flex justify-between items-center mb-6 px-4 pt-6">
            <span className="font-bold text-base text-gray-900 dark:text-white">תפריט</span>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer text-xl leading-none text-white dark:text-gray-300 bg-transparent border-none"
            >
              ✕
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-0">
            {/* 1. Store (collapsible with menus) */}
            {menus.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setStoreOpen((v) => !v)}
                  className={collapsibleClassName}
                >
                  <span className="text-right">חנות</span>
                  <span className={`text-sm text-gray-400 dark:text-gray-500 transition-transform duration-300 ${storeOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {storeOpen && (
                  <div className="flex flex-col gap-0.5">
                    {menus.map((menu) => (
                      <div key={menu.id}>
                        <button
                          type="button"
                          onClick={() => toggleMenuExpanded(menu.id)}
                          className={subCollapsibleClassName}
                        >
                          <span className="text-right">
                            {menu.name}
                          </span>
                          <span className={`text-sm text-gray-400 dark:text-gray-500 transition-transform duration-300 ${expandedMenus[menu.id] ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </button>

                        {expandedMenus[menu.id] && menu.sections.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            {menu.sections.map((section) => (
                              <Link
                                key={section.id}
                                href={`/store/${menu.id}?section=${section.id}`}
                                onClick={close}
                                className={subSubLinkClassName}
                              >
                                {section.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Border after Store */}
            <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>

            {/* 2. Wallet */}
            <Link href="/wallet" onClick={close} className={linkClassName}>
              הארנק שלי
            </Link>

            {/* 3. Orders */}
            <Link href="/orders" onClick={close} className={linkClassName}>
              <div className="flex justify-between items-center gap-2">
                <span>ההזמנות שלי</span>
                {counts.userOrders > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {counts.userOrders}
                  </span>
                )}
              </div>
            </Link>

            {/* Border after Orders (only if Staff/Admin section exists) */}
            {(role === "ADMIN" || role === "STAFF") && (
              <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>
            )}

            {/* 4. הפעלה (staff) */}
            {(role === "ADMIN" || role === "STAFF") && (
              <div>
                <button
                  type="button"
                  onClick={() => setStaffOpen((v) => !v)}
                  className={collapsibleClassName}
                >
                  <span className="text-right">הפעלה</span>
                  <span className={`text-sm text-gray-400 dark:text-gray-500 transition-transform duration-300 ${staffOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {staffOpen && (
                  <div className="flex flex-col gap-0.5">
                    <Link href="/staff/orders" onClick={close} className={subLinkClassName}>
                      <div className="flex justify-between items-center gap-2">
                        <span>תור ההזמנות</span>
                        {counts.allOrders > 0 && (
                          <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {counts.allOrders}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link href="/staff/schedule" onClick={close} className={subLinkClassName}>
                      לוח שיבוצים
                    </Link>
                    <Link href="/staff/procedures/opening" onClick={close} className={subLinkClassName}>
                      נוהל פתיחה
                    </Link>
                    <Link href="/staff/procedures/closing" onClick={close} className={subLinkClassName}>
                      נוהל סגירה
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 5. ניהול (admin only) */}
            {role === "ADMIN" && (
              <div>
                <button
                  type="button"
                  onClick={() => setAdminOpen((v) => !v)}
                  className={collapsibleClassName}
                >
                  <span className="text-right">ניהול</span>
                  <span className={`text-sm text-gray-400 dark:text-gray-500 transition-transform duration-300 ${adminOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {adminOpen && (
                  <div className="flex flex-col gap-0.5">
                    <Link href="/admin/users" onClick={close} className={subLinkClassName}>
                      משתמשים
                    </Link>
                    <Link href="/admin/messages" onClick={close} className={subLinkClassName}>
                      <div className="flex justify-between items-center gap-2">
                        <span>הודעות</span>
                        {openMessagesCount > 0 && (
                          <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {openMessagesCount}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div>
                      <button
                        type="button"
                        onClick={() => setReportsOpen((v) => !v)}
                        className={subCollapsibleClassName}
                      >
                        <span className="text-right">דוחות</span>
                        <span className={`text-sm text-gray-400 dark:text-gray-500 transition-transform duration-300 ${reportsOpen ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>
                      {reportsOpen && (
                        <>
                          <Link href="/admin/reports/transactions" onClick={close} className={subSubLinkClassName}>
                            תנועות
                          </Link>
                          <Link href="/admin/reports/items" onClick={close} className={subSubLinkClassName}>
                            פריטים
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Border after Admin (or after Orders for regular users) */}
            <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>

            {/* 5. Tutorial */}
            <button
              type="button"
              onClick={handleTutorialClick}
              className={linkClassName}
            >
              הדרכה
            </button>

            {/* 6. Contact us */}
            <Link href="/contactus" onClick={close} className={linkClassName}>
              צור קשר
            </Link>

            {/* Border before Logout */}
            <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>

            {/* 7. Logout */}
            <LogoutMenuButton />
          </nav>
        </div>
      )}
    </>
  );
}
