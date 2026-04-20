"use client";

import Image from "next/image";

interface PlayerAvatarProps {
  name: string;
  team: string;
  photo?: string;
  size?: "sm" | "md" | "lg";
  isHot?: boolean;
  badge?: "hot" | "volatile" | "featured" | null;
}

const teamColors: Record<string, [string, string]> = {
  Inter: ["#003DA5", "#0052A5"],
  Napoli: ["#0D5EAF", "#4A90D9"],
  Milan: ["#AC0A22", "#F03035"],
  Juventus: ["#1a1a1a", "#4a4a4a"],
  Roma: ["#8B0000", "#C9362B"],
  Liverpool: ["#C8102E", "#E84B5C"],
  "Real Madrid": ["#FEBE10", "#00529F"],
  PSG: ["#003F7B", "#DA291C"],
  "Man City": ["#6CABDD", "#1C2C5B"],
  Barcellona: ["#A50044", "#004D98"],
};

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getTeamGradient(team: string): string {
  const colors = teamColors[team] ?? ["#38e4ee", "#80faff"];
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

const sizeMap = {
  sm: { outer: 48, fontSize: "0.85rem" },
  md: { outer: 68, fontSize: "1.1rem" },
  lg: { outer: 88, fontSize: "1.4rem" },
};

const badgeEmoji: Record<string, string> = {
  hot: "🔥",
  volatile: "⚡",
  featured: "⭐",
};

export default function PlayerAvatar({
  name,
  team,
  photo,
  size = "md",
  isHot = false,
  badge = null,
}: PlayerAvatarProps) {
  const { outer, fontSize } = sizeMap[size];
  const initials = getInitials(name);
  const teamGrad = getTeamGradient(team);
  const ringSize = outer + 6;

  return (
    <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0 }}>
      {/* Gradient ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          padding: 3,
          background: isHot
            ? "linear-gradient(135deg, #f59e0b, #ef4444, #50f5fc)"
            : "linear-gradient(135deg, #38e4ee, #80faff)",
          animation: isHot ? "sm-ring-rotate 3s linear infinite" : undefined,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#13131a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={name}
              width={outer}
              height={outer}
              style={{
                width: outer,
                height: outer,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: outer,
                height: outer,
                borderRadius: "50%",
                background: teamGrad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight: 800,
                color: "white",
                fontFamily: "var(--font-sans, sans-serif)",
                letterSpacing: "0.02em",
                userSelect: "none",
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            background: "#0a0a0f",
            border: "1.5px solid rgba(80,245,252,0.5)",
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            zIndex: 1,
          }}
        >
          {badgeEmoji[badge]}
        </div>
      )}
    </div>
  );
}
