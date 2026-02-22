export default function EventIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preload" href="/images/event-cultura-bg.png" as="image" />
      <link rel="preload" href="/images/event-economia-bg.png" as="image" />
      <link rel="preload" href="/images/event-intrattenimento-bg.png" as="image" />
      <link rel="preload" href="/images/event-sport-bg.png" as="image" />
      <link rel="preload" href="/images/event-tecnologia-bg.png" as="image" />
      <link rel="preload" href="/images/event-scienza-bg.png" as="image" />
      <link rel="preload" href="/images/event-politica-bg.png" as="image" />
      {children}
    </>
  );
}
