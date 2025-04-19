import React, { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handlePasswordChange = () => {
    // Call your backend endpoint for password update here
    alert("Password updated successfully!");
  };

  const handleDeactivateAccount = () => {
    const confirm = window.confirm(
      "Are you sure you want to deactivate your account?"
    );
    if (confirm) {
      // Call backend API to deactivate account
      alert("Account deactivated.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Settings</h2>

        {/* Change Password */}
        <div className="mb-6">
          <h3 className="text-lg text-black font-medium mb-2">Change Password</h3>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-blue-500 text-black hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-black">Notification Preferences</h3>
          <label className="flex items-center space-x-2 text-black-700">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="form-checkbox"
            />
            <span className="text-black">Email notifications for loan updates</span>
          </label>
        </div>

        {/* 2FA */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-black">Two-Factor Authentication</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className="form-checkbox"
            />
            <span className="text-black">Enable Two-Factor Authentication (2FA)</span>
          </label>
        </div>

        {/* Deactivate Account */}
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-2 text-red-600">Danger Zone</h3>
          <button
            onClick={handleDeactivateAccount}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
