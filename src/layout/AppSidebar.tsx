import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { usePermission } from "../context/PermissionContext";
import { authStore } from "../store/authStore";
import RoleDashboard from "../pages/Dashboard/RoleDashboard";



const AppSidebar: React.FC = () => {

  const items: MenuItem[] = [
    { key: '/dashboard', icon: <GridIcon />, label: 'Dashboard', value: [<RoleDashboard />] },
    { key: '/koc', icon: <UserCircleIcon />, label: 'Quản lý KOC' },
    { key: '/brand', icon: <UserCircleIcon />, label: 'Quản lý Brand' },
    {
      key: '/campaigns',
      label: 'Vận hành chiến dịch',
      icon: <BoxCubeIcon />,
      children: [
        { key: '5', label: 'Option 5' },
        { key: '6', label: 'Option 6' },
        { key: '7', label: 'Option 7' },
        { key: '8', label: 'Option 8' },
      ],
    },
    {
      key: '/users',
      label: 'Navigation Two',
      icon: <UserCircleIcon />,
      children: [
        { key: '9', label: 'Option 9' },
        { key: '10', label: 'Option 10' },
        {
          key: 'sub3',
          label: 'Submenu',
          children: [
            { key: '11', label: 'Option 11' },
            { key: '12', label: 'Option 12' },
          ],
        },
      ],
    },
  ];
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { permissions } = usePermission();

  const allowedPaths = permissions ? Object.keys(permissions) : [];

  const location = useLocation();

  // Role KOC / BRAND chỉ thấy mục Dashboard
  const user = authStore((s) => s.user);

  const dashboardOnly = user?.roles?.includes("KOC") || user?.roles?.includes("BRAND");

  // const navItems = dashboardOnly
  //   ? allNavItems.filter((item) => item.path === "/dashboard")
  //   : allNavItems.filter(
  //     (item: NavItem) =>
  //       item.core || !permissions || allowedPaths.includes(item.path),
  //   );


  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );
  const handleMenuItemClick = ({ key, keyPath, selectedKeys, domEvent, itemData }) => {
    // Handle menu item click logic here
    console.log(`Clicked on menu item with path: ${key} , keyPath: ${keyPath}, selectedKeys: ${selectedKeys}, domEvent: ${domEvent}, itemData: ${itemData}`);
  }
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
  //   <ul className="flex flex-col gap-4">
  //     {items.map((nav, index) => (
  //       <li key={nav.name}>
  //         {nav.subItems ? (
  //           <button
  //             onClick={() => handleSubmenuToggle(index, menuType)}
  //             className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
  //               ? "menu-item-active"
  //               : "menu-item-inactive"
  //               } cursor-pointer ${!isExpanded && !isHovered
  //                 ? "lg:justify-center"
  //                 : "lg:justify-start"
  //               }`}
  //           >
  //             <span
  //               className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
  //                 ? "menu-item-icon-active"
  //                 : "menu-item-icon-inactive"
  //                 }`}
  //             >
  //               {nav.icon}
  //             </span>
  //             {(isExpanded || isHovered || isMobileOpen) && (
  //               <span className="menu-item-text">{nav.name}</span>
  //             )}
  //             {(isExpanded || isHovered || isMobileOpen) && (
  //               <ChevronDownIcon
  //                 className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
  //                   openSubmenu?.index === index
  //                   ? "rotate-180 text-brand-500"
  //                   : ""
  //                   }`}
  //               />
  //             )}
  //           </button>
  //         ) : (
  //           nav.path && (
  //             <Link
  //               to={nav.path}
  //               className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
  //                 }`}
  //             >
  //               <span
  //                 className={`menu-item-icon-size ${isActive(nav.path)
  //                   ? "menu-item-icon-active"
  //                   : "menu-item-icon-inactive"
  //                   }`}
  //               >
  //                 {nav.icon}
  //               </span>
  //               {(isExpanded || isHovered || isMobileOpen) && (
  //                 <span className="menu-item-text">{nav.name}</span>
  //               )}
  //             </Link>
  //           )
  //         )}
  //         {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
  //           <div
  //             ref={(el) => {
  //               subMenuRefs.current[`${menuType}-${index}`] = el;
  //             }}
  //             className="overflow-hidden transition-all duration-300"
  //             style={{
  //               height:
  //                 openSubmenu?.type === menuType && openSubmenu?.index === index
  //                   ? `${subMenuHeight[`${menuType}-${index}`]}px`
  //                   : "0px",
  //             }}
  //           >
  //             <ul className="mt-2 space-y-1 ml-9">
  //               {nav.subItems.map((subItem) => (
  //                 <li key={subItem.name}>
  //                   <Link
  //                     to={subItem.path}
  //                     className={`menu-dropdown-item ${isActive(subItem.path)
  //                       ? "menu-dropdown-item-active"
  //                       : "menu-dropdown-item-inactive"
  //                       }`}
  //                   >
  //                     {subItem.name}
  //                     <span className="flex items-center gap-1 ml-auto">
  //                       {subItem.new && (
  //                         <span
  //                           className={`ml-auto ${isActive(subItem.path)
  //                             ? "menu-dropdown-badge-active"
  //                             : "menu-dropdown-badge-inactive"
  //                             } menu-dropdown-badge`}
  //                         >
  //                           new
  //                         </span>
  //                       )}
  //                       {subItem.pro && (
  //                         <span
  //                           className={`ml-auto ${isActive(subItem.path)
  //                             ? "menu-dropdown-badge-active"
  //                             : "menu-dropdown-badge-inactive"
  //                             } menu-dropdown-badge`}
  //                         >
  //                           pro
  //                         </span>
  //                       )}
  //                     </span>
  //                   </Link>
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>
  //         )}
  //       </li>
  //     ))}
  //   </ul>
  // );
  // return (
  //   <div className="fixed flex-1 height">
  //     <div className="">

  //     </div>
  //     <div
  //           className={`py-5 flex ${!isExpanded ? "lg:justify-center" : "justify-center"
  //             }`}
  //         >
  //           <Link to="/" className="max-w-[100px] max-h-[60px]">
  //             {isExpanded || isHovered || isMobileOpen ? (
  //               <>
  //                 <img
  //                   className="dark:hidden w-full max-w-xs h-auto"
  //                   src="/images/logo.png"
  //                   alt="Logo"
  //                 />
  //                 <img
  //                   className="hidden dark:block"
  //                   src="/images/logo.png"
  //                   alt="Logo"
  //                   width={150}
  //                   height={40}
  //                 />
  //               </>
  //             ) : (
  //               <img
  //                 src="/images/logo.png"
  //                 alt="Logo"
  //                 width={32}
  //                 height={32}
  //               />
  //             )}
  //           </Link>
  //         </div>
  //     <Menu
  //       defaultSelectedKeys={['1']}
  //       defaultOpenKeys={['sub1']}
  //       mode="inline"
  //       // theme="dark"
  //       inlineCollapsed={collapsed}
  //       items={items}
  //     />
  //   </div>
  // );
  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 flex ${!isExpanded ? "lg:justify-center" : "justify-center"
          }`}
      >
        <Link to="/" className="max-w-[100px] max-h-[60px]">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden w-full max-w-xs h-auto"
                src="/images/logo.png"
                alt="Logo"
              />
              <img
                className="hidden dark:block"
                src="/images/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <Menu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                inlineCollapsed={collapsed}
                items={items}
                onClick={handleMenuItemClick}
              />
              {/* {renderMenuItems(navItems, "main")} */}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
