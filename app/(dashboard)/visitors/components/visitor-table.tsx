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

export function VisitorTable({
  visitors,
}: {
  visitors: Visitor[];
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[950px]">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visitor
            </th>

            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ID
            </th>

            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </th>

            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last Visit
            </th>

            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Registered
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {visitors.map((visitor) => (
            <tr
              key={visitor.id}
              className="transition hover:bg-muted/30"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <VisitorAvatar
                    name={visitor.name}
                    imagePath={
                      visitor.image_path
                    }
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {visitor.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Registered{" "}
                      {formatDate(
                        visitor.created_at,
                      )}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <p className="text-sm font-medium">
                  {formatIdType(
                    visitor.id_type,
                  )}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {visitor.contact_number}
                </p>
              </td>

              <td className="px-5 py-4">
                <VisitorStatus
                  isInside={
                    visitor.is_inside
                  }
                />
              </td>

              <td className="px-5 py-4 text-sm">
                {formatDate(
                  visitor.last_visit,
                )}
              </td>

              <td className="px-5 py-4 text-sm text-muted-foreground">
                {formatDate(
                  visitor.created_at,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}