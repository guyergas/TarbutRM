"use client";

import { useState } from "react";
import EditUserForm from "./EditUserForm";
import { updateUserAction } from "./actions";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string;
  street: string | null;
  role: "USER" | "STAFF" | "ADMIN";
  active: boolean;
  balance: string;
};

const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const valueCls = "mt-1 block w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md";

export default function EditableUserForm({ 
  user, 
  isAdminEdit = true 
}: { 
  user: User;
  isAdminEdit?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-4">
      {/* Edit Form or Read-only View */}
      {isEditing ? (
        <EditUserForm
          user={user}
          formAction={updateUserAction}
          isAdminEdit={isAdminEdit}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-4">
          {/* Edit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              עדכן פרטים
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>שם פרטי</label>
                <p className={valueCls}>{user.firstName}</p>
              </div>
              <div>
                <label className={labelCls}>שם משפחה</label>
                <p className={valueCls}>{user.lastName}</p>
              </div>
              <div>
                <label className={labelCls}>אימייל</label>
                <p className={valueCls}>{user.email}</p>
              </div>
              <div>
                <label className={labelCls}>טלפון</label>
                <p className={valueCls}>{user.phone || "—"}</p>
              </div>
              <div>
                <label className={labelCls}>עיר</label>
                <p className={valueCls}>{user.city}</p>
              </div>
              <div>
                <label className={labelCls}>רחוב ומספר בית</label>
                <p className={valueCls}>{user.street || "—"}</p>
              </div>
              {isAdminEdit && (
                <>
                  <div>
                    <label className={labelCls}>תפקיד</label>
                    <p className={valueCls}>{user.role === "ADMIN" ? "מנהל" : user.role === "STAFF" ? "צוות" : "משתמש"}</p>
                  </div>
                  <div>
                    <label className={labelCls}>סטטוס</label>
                    <p className={`${valueCls} ${user.active ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}`}>
                      {user.active ? "פעיל" : "מושבת"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
