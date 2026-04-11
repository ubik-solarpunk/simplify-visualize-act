import { archiveRecords } from "@/lib/ubik-data";
import { SectionHeading, Surface } from "@/components/ubik-primitives";

export default function Archive() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeading
          eyebrow="History"
          title="Archive holds prior work without changing the shell."
          description="Older records remain accessible, typed, and readable so operators can pull context back into active tabs when needed."
        />

        <Surface className="overflow-hidden">
          <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] border-b border-border bg-card px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Record</span>
            <span>Type</span>
            <span>Updated</span>
            <span>Owner</span>
          </div>
          {archiveRecords.map((record) => (
            <div key={record.id} className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] border-b border-border px-4 py-4 text-sm last:border-b-0">
              <span>{record.title}</span>
              <span className="text-muted-foreground">{record.type}</span>
              <span className="text-muted-foreground">{record.updatedAt}</span>
              <span className="text-muted-foreground">{record.owner}</span>
            </div>
          ))}
        </Surface>
      </div>
    </div>
  );
}
