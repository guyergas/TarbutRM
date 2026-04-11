"use client";

import ItemEditor from "@/components/ItemEditor";

interface CreateItemModalProps {
  section: {
    id: string;
    name: string;
    menuId: string;
    menu: { id: string; name: string };
  };
  userId: string;
  onClose: () => void;
}

export default function CreateItemModal({
  section,
  userId,
  onClose,
}: CreateItemModalProps) {
  const newItem = {
    id: "",
    name: "",
    description: "",
    price: 0,
    inStock: true,
    archived: false,
    image: "",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="m-0 mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          יצירת מוצר חדש
        </h1>

        <ItemEditor
          item={newItem}
          section={section}
          stockHistory={[]}
          userId={userId}
          onClose={onClose}
          isNew={true}
        />
      </div>
    </div>
  );
}
