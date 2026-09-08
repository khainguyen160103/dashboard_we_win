import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button, Flex, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { authStore } from "../../store/authStore";
import { Link } from "react-router"; 

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { useLogout } = useAuth();
  const user = authStore((state) => state.user);
  console.log(user);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    useLogout.mutate();
    closeDropdown();
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <Link to="/profile">
          <Button type="text">
            Hồ sơ cá nhân
          </Button>
        </Link>
      ),
      key: 'profile',
    },

    {
      label: (
        <Button type="text" onClick={handleSignOut}>
          Đăng xuất
        </Button>
      ),
      key: 'logout',
    }
  ];

  return (
    <Flex className="relative">
      <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm">
        {user?.fullName.slice(0, 2).toUpperCase()}
      </span>


      <Dropdown menu={{ items }} trigger={['click']}>
        <Space>
          <Button
            type="text"
            onClick={toggleDropdown}
          >


            <span className="block mr-1 font-medium text-theme-sm text-gray-800 dark:text-gray-200">
              {user?.fullName}
            </span>

            <svg
              className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
              width="18"
              height="20"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </Space>
      </Dropdown>
    </Flex>
  );
}
