"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutMenuButton from "./LogoutMenuButton";

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
}

const linkStyle: React.CSSProperties = {
  padding: "10px 8px",
  borderRadius: 8,
  color: "#374151",
  textDecoration: "none",
  fontSize: 15,
  fontWeight: 500,
  display: "block",
  textAlign: "right",
};

const collapsibleStyle: React.CSSProperties = {
  ...linkStyle,
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: 8,
  width: "100%",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "10px 8px",
  paddingRight: 8,
};

const subCollapsibleStyle: React.CSSProperties = {
  ...collapsibleStyle,
  paddingRight: 40,
  fontSize: 14,
};

const subLinkStyle: React.CSSProperties = {
  ...linkStyle,
  paddingRight: 40,
  fontSize: 14,
};

const subSubLinkStyle: React.CSSProperties = {
  ...linkStyle,
  paddingRight: 64,
  fontSize: 13,
};

export default function TopBarClient({ role, menus, balance, cartIcon, openOrdersCount = 0 }: TopBarClientProps) {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [personalAreaOpen, setPersonalAreaOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  function close() {
    setOpen(false);
  }

  function toggleMenuExpanded(menuId: string) {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  }

  return (
    <>
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 16px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Hamburger + Home icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              aria-label="פתח תפריט"
              onClick={() => setOpen(true)}
              style={{
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                pointerEvents: "auto",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link
              href="/"
              title="בית"
              style={{
                display: "flex",
                alignItems: "center",
                color: "#374151",
                textDecoration: "none",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#374151"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </Link>
          </div>

          {/* Balance + Cart + Profile icon */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {balance && (
              <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                יתרה: ₪{balance}
              </div>
            )}
            {cartIcon}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        />
      )}

      {/* Slide-in panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 196,
            background: "#fff",
            boxShadow: "-2px 0 12px rgba(0,0,0,0.15)",
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            padding: 24,
            overflowY: "auto",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>תפריט</span>
            <button
              type="button"
              onClick={close}
              style={{
                cursor: "pointer",
                fontSize: 22,
                lineHeight: 1,
                color: "#374151",
                background: "none",
                border: "none",
              }}
            >
              ✕
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* 1. Admin (admin/staff) */}
            {(role === "ADMIN" || role === "STAFF") && (
              <div>
                <button
                  type="button"
                  onClick={() => setAdminOpen((v) => !v)}
                  style={collapsibleStyle}
                >
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {adminOpen ? "▲" : "▼"}
                  </span>
                  <span style={{ flex: 1, textAlign: "right" }}>ניהול</span>
                </button>

                {adminOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {role === "ADMIN" && (
                      <Link href="/admin/users" onClick={close} style={subLinkStyle}>
                        משתמשים
                      </Link>
                    )}
                    <Link href="/staff/queue" onClick={close} style={subLinkStyle}>
                      תור ההזמנות
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 2. Store (collapsible with menus) */}
            {menus.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setStoreOpen((v) => !v)}
                  style={collapsibleStyle}
                >
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {storeOpen ? "▲" : "▼"}
                  </span>
                  <span style={{ flex: 1, textAlign: "right" }}>חנות</span>
                </button>

                {storeOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {menus.map((menu) => (
                      <div key={menu.id}>
                        <button
                          type="button"
                          onClick={() => toggleMenuExpanded(menu.id)}
                          style={subCollapsibleStyle}
                        >
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>
                            {expandedMenus[menu.id] ? "▲" : "▼"}
                          </span>
                          <span style={{ flex: 1, textAlign: "right" }}>
                            {menu.name}
                          </span>
                        </button>

                        {expandedMenus[menu.id] && menu.sections.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {menu.sections.map((section) => (
                              <Link
                                key={section.id}
                                href={`/store/${menu.id}?section=${section.id}`}
                                onClick={close}
                                style={subSubLinkStyle}
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

            {/* 3. Personal Area (collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setPersonalAreaOpen((v) => !v)}
                style={collapsibleStyle}
              >
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {personalAreaOpen ? "▲" : "▼"}
                </span>
                <span style={{ flex: 1, textAlign: "right" }}>
                  האזור האישי
                  {openOrdersCount > 0 && (
                    <span style={{
                      marginRight: 8,
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {openOrdersCount}
                    </span>
                  )}
                </span>
              </button>

              {personalAreaOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Link href="/profile" onClick={close} style={subLinkStyle}>
                    הפרופיל שלי
                  </Link>
                  <Link href="/wallet" onClick={close} style={subLinkStyle}>
                    הארנק שלי
                  </Link>
                  <Link href="/orders" onClick={close} style={subLinkStyle}>
                    ההזמנות שלי
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Contact us */}
            <Link href="/contactus" onClick={close} style={linkStyle}>
              צור קשר
            </Link>

            {/* 5. Logout */}
            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 16, paddingTop: 16 }}>
              <LogoutMenuButton />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
