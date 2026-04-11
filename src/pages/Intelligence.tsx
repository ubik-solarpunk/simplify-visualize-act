import { Radar } from "lucide-react";

import { SectionHeading, StatusPill, Surface } from "@/components/ubik-primitives";
import { intelligenceRecords } from "@/lib/ubik-data";

export default function Intelligence() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Monitoring"
          title="Intelligence keeps research, watchlists, and saved reports readable."
          description="This surface stays operational: fresh signals, source visibility, and a stable shell grammar instead of a flashy research dashboard."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {intelligenceRecords.map((record) => (
            <Surface key={record.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <StatusPill tone="default">{record.source}</StatusPill>
                <Radar className="h-4 w-4 text-primary" />
              </div>
              <h2 className="mt-4 font-mono text-lg font-semibold">{record.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{record.summary}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{record.freshness}</p>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}
