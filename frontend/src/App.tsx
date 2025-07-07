import MessageProvider from "./contexts/messagesProvider";
import ProfileProvider from "./contexts/profileProvider";
import AppLayout from "./layout/AppLayout";
import CurrentProvider from "./contexts/currentprovider";
import UiProvider from "./contexts/notificationProvider";
import Auth from "./components/auth/auth";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotificationProvider from "./contexts/notificationProvider";
import Home from "./components/home";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/app",
      element: <AppLayout />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
  ]);
  return (
    <UiProvider>
      <ProfileProvider>
        <NotificationProvider>
          <CurrentProvider>
            <MessageProvider>
             
              <RouterProvider router={router} />
            </MessageProvider>
          </CurrentProvider>
        </NotificationProvider>
      </ProfileProvider>
    </UiProvider>
  );
}

export default App;
