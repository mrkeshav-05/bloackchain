import './globals.css';

export const metadata = {
  title: 'GetSet Contract - DApp',
  description: 'Interact with GetSet smart contract',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
  