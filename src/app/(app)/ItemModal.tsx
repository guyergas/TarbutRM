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
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          zIndex: 101,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          direction: "rtl",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#374151",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Image */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100%",
              height: "300px",
              objectFit: "contain",
              background: "#f3f4f6",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "300px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            אין תמונה
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "#1f2937",
            }}
          >
            {item.name}
          </h2>

          {item.description && (
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0 0 16px 0",
                lineHeight: "1.6",
              }}
            >
              {item.description}
            </p>
          )}

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
            }}
          >
            {item.price} ₪
          </div>
        </div>
      </div>
    </>
  );
}
