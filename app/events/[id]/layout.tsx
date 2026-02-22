export default function EventIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preload" href="/images/event-cinema-bg.png" as="image" />
      <link rel="preload" href="/images/event-economia-bg.png" as="image" />
      {children}
    </>
  );
}
