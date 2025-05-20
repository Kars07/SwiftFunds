import React, { useState } from "react";

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState<boolean>(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [passwords, setPasswords] = useState<{
    current: string;
    new: string;
    confirm: string;
  }>({
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
    <div className="min-h-screen  bg-gray-100">
      <div className=" md:p-4 md:pt-5 pt-10 mx-auto">
        <h2 className="text-3xl font-semibold mb-10 text-black">Settings</h2>
        {/* Change Password */}
        <div className="mb-6 shadow-lg bg-white md:w-[80%] p-8 rounded-2xl ">
          <h3 className="text-lg text-black font-medium mb-9">Change Password</h3>
          <div className="space-y-4">
            <input
             
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-transform duration-200 hover:scale-105 cursor-pointer px-6 py-3 rounded-4xl"
            >
              Update Password
            </button>
          </div>
        </div>
        <div className="flex md:flex-row flex-col pt-8 w-full space-x-8">
          {/* Notification Settings */}
          <div className="mb-6 w-[300px] h-[200px] bg-white shadow-xl rounded-xl px-5 py-12 ">
            
            <h3 className="text-lg font-medium mb-2 text-black">
              Notification Preferences
            </h3>
            <label className="flex items-center space-x-2 text-black-700">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="form-checkbox"
              />
              <span className="text-black -mb-3 pt-2">
                Email notifications for loan updates
              </span>
            </label>
          </div>

          {/* 2FA */}
          <div className="mb-6 bg-white  h-[200px] shadow-xl rounded-xl w-[300px] px-5 py-12">
            <h3 className="text-lg font-medium mb-2 text-black">
              Two-Factor Authentication
            </h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className="form-checkbox"
              />
              <span className="text-black -mb-3 pt-2">
                Enable Two-Factor Authentication (2FA)
              </span>
            </label>
          </div>

          {/* Deactivate Account */}
          <div className=" bg-white h-[200px] shadow-xl rounded-xl w-[300px] px-5 py-10">
            <h3 className="text-lg font-medium mb-6 text-orange-600">Danger Zone</h3>
            <button
              onClick={handleDeactivateAccount}
              className="border-2 border-orange-600 text-orange-600 delay-100 duration-200 cursor-pointer hover:bg-orange-600 hover:text-white px-6 py-2 rounded-2xl"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;