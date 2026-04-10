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
    <div className="flex flex-col h-screen bg-black dark:bg-black">
      {/* Menu Navigation Bar */}
      <div className="bg-black dark:bg-black border-t-2 border-b-2 border-gray-700 dark:border-gray-700 p-0 overflow-x-auto sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex gap-0 items-stretch justify-between">
          <div className="flex gap-0 items-stretch flex-1 overflow-auto">
            {allMenus.map((menu, index) => (
              <Link
                key={menu.id}
                href={`/store/${menu.id}`}
                className={`py-3 px-4 no-underline text-xs flex items-center whitespace-nowrap border-none ${
                  menu.id === currentMenu.id
                    ? "font-semibold text-white bg-black dark:bg-black"
                    : "font-medium text-gray-400 dark:text-gray-500 bg-transparent"
                }`}
              >
                {menu.name}
              </Link>
            ))}
          </div>
          {userRole === "ADMIN" && (
            <div className="flex gap-0.5 items-center px-2 border-r-2 border-gray-700 dark:border-gray-700">
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
      <div className="flex flex-1 overflow-hidden bg-black dark:bg-black">
        {/* Sections Sidebar */}
        <aside className="w-32 flex-shrink-0 border-l-2 border-r-2 border-t border-gray-700 dark:border-gray-700 overflow-y-auto bg-black dark:bg-black py-4 flex flex-col">
          {userRole === "ADMIN" && selectedSection && (
            <div className="flex gap-0.5 items-center px-1 pb-3 border-b border-gray-700 dark:border-gray-700 mb-3 justify-end overflow-hidden min-w-0">
              <SectionControls
                section={selectedSection}
                sections={currentMenu.sections}
                menuId={currentMenu.id}
              />
              <CreateSectionButton menuId={currentMenu.id} />
            </div>
          )}

          {currentMenu.sections.length === 0 ? (
            <div className="px-4 text-gray-400 dark:text-gray-500 text-sm">
              אין קטגוריות
            </div>
          ) : (
            <nav className="flex flex-col">
              {currentMenu.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`py-3 px-2 border-none text-right cursor-pointer text-xs transition-all overflow-hidden text-ellipsis whitespace-nowrap min-w-0 ${
                    section.id === selectedSectionId
                      ? "font-semibold text-white bg-black dark:bg-black border-l-[3px] border-white dark:border-white pl-1"
                      : "font-medium text-gray-400 dark:text-gray-500 bg-transparent"
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Items Grid */}
        <main className="flex-1 overflow-y-auto p-6 bg-black dark:bg-black">
          {!selectedSection ? (
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              בחר קטגוריה
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-white dark:text-white">
                {selectedSection.name}
              </h2>

              {selectedSection.items.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  אין מוצרים בקטגוריה זו
                </div>
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
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
