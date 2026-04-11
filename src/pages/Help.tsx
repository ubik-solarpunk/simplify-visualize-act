import { SectionHeading, SmallButton, Surface } from "@/components/ubik-primitives";
import { helpResources } from "@/lib/ubik-data";

export default function Help() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeading
          eyebrow="Support"
          title="Help keeps operator guidance close to the product."
          description="Support content should stay concise, operational, and aligned with the shell rather than feeling like a separate marketing or docs surface."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {helpResources.map((resource) => (
            <Surface key={resource.id} className="p-5">
              <h2 className="font-mono text-lg font-semibold">{resource.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{resource.description}</p>
              <div className="mt-5">
                <SmallButton>{resource.action}</SmallButton>
              </div>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}
