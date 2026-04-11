import { SectionHeading, Surface } from "@/components/ubik-primitives";
import { settingsSections } from "@/lib/ubik-data";

export default function Settings() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Workspace Preferences"
          title="Settings expose environment, connectors, and operator defaults clearly."
          description="Keep configuration explicit and translation-friendly, with environment visibility staying in the product rather than hidden in implementation details."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <Surface key={section.id} className="p-5">
              <h2 className="font-mono text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
              <div className="mt-4 space-y-3">
                {section.values.map((value) => (
                  <div key={value.label} className="border border-border bg-background p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{value.label}</p>
                    <p className="mt-2 text-sm">{value.value}</p>
                  </div>
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}
