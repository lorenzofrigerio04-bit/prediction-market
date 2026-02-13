/**
 * Utility function per risolvere eventi chiusi
 * Può essere chiamata dal client o dal server
 */
export async function resolveClosedEvents() {
  try {
    const response = await fetch("/api/events/resolve-closed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore risolvendo eventi chiusi:", error);
    throw error;
  }
}
