"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ItemCard from "./ItemCard";
import MenuControls from "./MenuControls";
import SectionControls from "./SectionControls";
import CreateMenuButton from "./CreateMenuButton";
import CreateSectionButton from "./CreateSectionButton";
import CreateItemButton from "./CreateItemButton";

interface Item {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  inStock: boolean;
  position: number;
  archived: boolean;
  image?: string;
}

interface Section {
  id: string;
  menuId: string;
  name: string;
  archived: boolean;
  position: number;
  items: Item[];
}

interface Menu {
  id: string;
  name: string;
  archived: boolean;
  position: number;
  sections: Section[];
}

interface StoreViewProps {
  currentMenu: Menu;
  allMenus: Menu[];
  userRole: "USER" | "STAFF" | "ADMIN";
  userId: string;
}

export default function StoreView({
  currentMenu,
  allMenus,
  userRole,
  userId,
}: StoreViewProps) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sectionParam ?? currentMenu.sections[0]?.id ?? null
  );

  // Update selected section if section param changes
  useEffect(() => {
    if (sectionParam) {
      setSelectedSectionId(sectionParam);
    }
  }, [sectionParam]);

  const selectedSection = currentMenu.sections.find(
    (s) => s.id === selectedSectionId
  ) || currentMenu.sections[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Menu Navigation Bar */}
      <div
        style={{
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 0",
          overflowX: "auto",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flex: 1,
              overflow: "auto",
            }}
          >
            {allMenus.map((menu) => (
              <Link
                key={menu.id}
                href={`/store/${menu.id}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: menu.id === currentMenu.id ? 600 : 500,
                  color: menu.id === currentMenu.id ? "#1f2937" : "#6b7280",
                  background:
                    menu.id === currentMenu.id ? "#fff" : "transparent",
                  border:
                    menu.id === currentMenu.id
                      ? "1px solid #e5e7eb"
                      : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {menu.name}
              </Link>
            ))}
          </div>
          {userRole === "ADMIN" && (
            <div
              style={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                paddingLeft: 8,
                borderLeft: "1px solid #d1d5db",
              }}
            >
              <MenuControls
                menu={currentMenu}
                allMenus={allMenus}
              />
              <CreateMenuButton />
            </div>
          )}
        </div>
      </div>

      {/* Main content: sidebar + grid */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sections Sidebar */}
        <aside
          style={{
            width: 200,
            borderRight: "1px solid #e5e7eb",
            overflowY: "auto",
            background: "#f9fafb",
            padding: "16px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {userRole === "ADMIN" && selectedSection && (
            <div
              style={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                paddingRight: 16,
                paddingLeft: 8,
                paddingBottom: 12,
                borderBottom: "1px solid #e5e7eb",
                marginBottom: 12,
                justifyContent: "flex-end",
              }}
            >
              <SectionControls
                section={selectedSection}
                sections={currentMenu.sections}
                menuId={currentMenu.id}
              />
              <CreateSectionButton menuId={currentMenu.id} />
            </div>
          )}

          {currentMenu.sections.length === 0 ? (
            <div style={{ padding: "16px", color: "#6b7280", fontSize: 14 }}>
              אין קטגוריות
            </div>
          ) : (
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {currentMenu.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    background:
                      section.id === selectedSectionId
                        ? "#dbeafe"
                        : "transparent",
                    color:
                      section.id === selectedSectionId
                        ? "#1e40af"
                        : "#6b7280",
                    textAlign: "right",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight:
                      section.id === selectedSectionId ? 600 : 500,
                    borderLeft:
                      section.id === selectedSectionId
                        ? "3px solid #1e40af"
                        : "none",
                    paddingLeft:
                      section.id === selectedSectionId ? 13 : 16,
                    transition: "all 0.2s",
                  }}
                >
                  {section.name}
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Items Grid */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 16px",
          }}
        >
          {!selectedSection ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              בחר קטגוריה
            </div>
          ) : (
            <>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "#1f2937",
                }}
              >
                {selectedSection.name}
              </h2>

              {selectedSection.items.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  אין מוצרים בקטגוריה זו
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  {selectedSection.items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      userRole={userRole}
                      userId={userId}
                    />
                  ))}
                  {userRole === "ADMIN" && (
                    <CreateItemButton
                      sectionId={selectedSection.id}
                      section={{
                        ...selectedSection,
                        menu: {
                          id: currentMenu.id,
                          name: currentMenu.name,
                        },
                      }}
                      userId={userId}
                    />
                  )}
                </div>
              )}
              {selectedSection.items.length === 0 && userRole === "ADMIN" && (
                <CreateItemButton
                  sectionId={selectedSection.id}
                  section={{
                    ...selectedSection,
                    menu: {
                      id: currentMenu.id,
                      name: currentMenu.name,
                    },
                  }}
                  userId={userId}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
