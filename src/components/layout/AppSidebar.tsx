import { 
  LayoutDashboard, 
  User, 
  Network, 
  Users, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Gift, 
  DollarSign, 
  Bell,
  BadgeDollarSign,
  ChevronDown,
  TreePine
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logo } from "@/components/Logo";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/profile", icon: User },
];

const networkStages = [
  { title: "Stage 1", url: "/network/stage/1", icon: TreePine },
  { title: "Stage 2", url: "/network/stage/2", icon: TreePine },
  { title: "Stage 3", url: "/network/stage/3", icon: TreePine },
  { title: "Stage 4", url: "/network/stage/4", icon: TreePine },
];

const otherMenuItems = [
  { title: "My Team Report", url: "/team-report", icon: Users },
  { title: "My Income Report", url: "/income-report", icon: TrendingUp },
  { title: "E-Wallet", url: "/e-wallet", icon: Wallet },
  { title: "Registration Wallet", url: "/registration-wallet", icon: CreditCard },
  { title: "Incentive Wallet", url: "/incentive-wallet", icon: Gift },
  { title: "Payout Management", url: "/payout-management", icon: DollarSign },
  { title: "My Payouts", url: "/my-payouts", icon: BadgeDollarSign },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";
  const isNetworkActive = currentPath.startsWith("/network");

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-sidebar-background via-sidebar-accent to-sidebar-background">
      <SidebarHeader className="p-6 border-b border-sidebar-border/20">
        <Logo showText={!isCollapsed} className="text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className="w-full h-auto p-0 bg-transparent hover:bg-transparent"
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg transform scale-105" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:transform hover:scale-102"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      {!isCollapsed && (
                        <div className="ml-auto">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* My Network with Stages Submenu */}
              <Collapsible asChild defaultOpen={isNetworkActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={isCollapsed ? "My Network" : undefined}
                      className={`w-full h-auto p-0 bg-transparent hover:bg-transparent ${
                        isNetworkActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg rounded-xl" : ""
                      }`}
                    >
                      <div className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 w-full ${
                        isNetworkActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}>
                        <Network className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">My Network</span>}
                        {!isCollapsed && (
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-6 mt-2 space-y-1">
                        {networkStages.map((stage) => (
                          <SidebarMenuSubItem key={stage.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={stage.url}
                                className={({ isActive }) => 
                                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive 
                                      ? "bg-sidebar-primary/80 text-sidebar-primary-foreground shadow-md" 
                                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                                  }`
                                }
                              >
                                <stage.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm font-medium">{stage.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>

              {otherMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className="w-full h-auto p-0 bg-transparent hover:bg-transparent"
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg transform scale-105" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:transform hover:scale-102"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      {!isCollapsed && (
                        <div className="ml-auto">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}