"use client";

import { useRouter } from "next/navigation";
import ItemEditor from "./ItemEditor";

interface StockHistory {
  id: string;
  inStock: boolean;
  changedAt: string;
  changer: { firstName: string; lastName: string; role: string };
}

interface ItemEditorModalProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    inStock: boolean;
    image?: string;
    archived: boolean;
  };
  section: {
    id: string;
    name: string;
    menuId: string;
    menu: { id: string; name: string };
  };
  stockHistory: StockHistory[];
  userId: string;
}

export default function ItemEditorModal({
  item,
  section,
  stockHistory,
  userId,
}: ItemEditorModalProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h1 className="m-0 mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          עריכת מוצר
        </h1>

        <ItemEditor
          item={item}
          section={section}
          stockHistory={stockHistory}
          userId={userId}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
