import React from 'react';
// Uncomment next line if you want to use react-icons for a logout icon
// import { FiLogOut } from "react-icons/fi";

export default function Header({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        {/* Logo or Icon - replace emoji with your own SVG or use a library */}
        <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-black text-2xl shadow-sm">
          {/* Example: 🎓. Replace with your logo if desired */}
          <span role="img" aria-label="logo">🎓</span>
        </div>
        <div>
          <div className="font-black text-2xl tracking-tight text-gray-800 flex items-center gap-2">
            Joineazy
          </div>
          <div className="text-xs text-gray-400 italic mt-1">
            Assignment & Review Dashboard
          </div>
        </div>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-5 bg-gray-50 px-4 py-2 rounded-lg shadow border">
            <div className="text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="italic text-blue-500">{user.role}</span>
            </div>
            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition font-semibold shadow-sm"
              onClick={onLogout}
            >
              {/* If using react-icons, uncomment next line */}
              {/* <FiLogOut /> */}
              {/* Otherwise, use emoji or SVG as below */}
              <span role="img" aria-label="logout">🔓</span>
              Logout
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Select a user to continue</div>
        )}
      </div>
    </header>
  );
}