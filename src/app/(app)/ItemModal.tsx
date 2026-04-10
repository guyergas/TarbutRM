"use client";

interface ItemModalProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: string | number;
    image?: string;
  };
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-100"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-2xl z-101 max-w-lg w-11/12 max-h-[90vh] overflow-y-auto rtl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 bg-none border-none text-2xl cursor-pointer text-gray-600 dark:text-gray-400 z-10 hover:text-gray-900 dark:hover:text-gray-200"
        >
          ✕
        </button>

        {/* Image */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-80 object-contain bg-gray-100 dark:bg-gray-700"
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
            אין תמונה
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold m-0 mb-3 text-gray-900 dark:text-white">
            {item.name}
          </h2>

          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 m-0 mb-4 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {item.price} ₪
          </div>
        </div>
      </div>
    </>
  );
}
