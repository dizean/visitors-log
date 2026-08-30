"use client";

import type { Visitor } from "@/lib/supabase/visitors";

import { VisitorAvatar } from "./visitor-avatar";
import { VisitorStatus } from "./visitor-status";

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

function formatIdType(
  value: Visitor["id_type"],
) {
  if (!value) {
    return "No ID type";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function maskIdNumber(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  if (value.length <= 4) {
    return "••••";
  }

  return `${"•".repeat(
    Math.max(4, value.length - 4),
  )}${value.slice(-4)}`;
}

export function VisitorMobileList({
  visitors,
}: {
  visitors: Visitor[];
}) {
  return (
    <div className="divide-y md:hidden">
      {visitors.map((visitor) => (
        <article
          key={visitor.id}
          className="p-4"
        >
          <div className="flex items-start gap-3">
            <VisitorAvatar
              name={visitor.name}
              imagePath={visitor.image_path}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">
                    {visitor.name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatIdType(
                      visitor.id_type,
                    )}
                  </p>
                </div>

                <VisitorStatus
                  isInside={
                    visitor.is_inside
                  }
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3">
                <InfoItem
                  label="ID Number"
                  value={maskIdNumber(
                    visitor.id_number,
                  )}
                />

                <InfoItem
                  label="Last Visit"
                  value={formatDate(
                    visitor.last_visit,
                  )}
                />

                <InfoItem
                  label="Registered"
                  value={formatDate(
                    visitor.created_at,
                  )}
                />

                <InfoItem
                  label="Status"
                  value={
                    visitor.is_inside
                      ? "Currently Inside"
                      : "Outside"
                  }
                />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium">
        {value}
      </p>
    </div>
  );
}