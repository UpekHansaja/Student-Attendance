import "./globals.css";

export const metadata = {
  title: "Student Attendance",
  description: "Student Attendance System - Java Institute Gampaha",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
