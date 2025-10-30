"use client";
import Loader from "../components/Loader";
// import { UserProvider } from "../context/UserContext";
// import AdminNavbar from "../components/Navbar/AdminNavbar";
// import { InstantDBProvider } from "../context/InstantProvider";
import PrivateNavbar from "../components/Navbar/PrivateNavbar";
import { useUserContext } from "../context/UserContext";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useUserContext();
    if (loading) {
    return (
      <div className="fixed inset-0 flex  items-center justify-center">
        <Loader className="h-20 w-20 !border-primary border-t-5 border-b-5" />
      </div>
    );
  }
  
  return (
    <>
      {/* <UserProvider> */}
        {/* <AdminNavbar />
            <HeaderStats /> */}
        <PrivateNavbar />
        <main>{children}</main>
        {/* <FooterAdmin /> */}
      {/* </UserProvider> */}
    </>
  );
}
