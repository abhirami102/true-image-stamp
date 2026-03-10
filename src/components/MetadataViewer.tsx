import { type ProvenanceMetadata } from "@/lib/crypto";

interface MetadataViewerProps {
  metadata: ProvenanceMetadata;
}

export function MetadataViewer({ metadata }: MetadataViewerProps) {
  const fields = [
    { label: "Issuer", value: metadata.issuer },
    { label: "Version", value: metadata.version },
    { label: "Timestamp", value: new Date(metadata.timestamp).toISOString() },
    { label: "Algorithm", value: metadata.algorithm },
    { label: "Image Hash (SHA-256)", value: metadata.image_hash, mono: true },
    { label: "Signature", value: metadata.signature.slice(0, 64) + "...", mono: true },
  ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
        Provenance Metadata
      </h3>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <span className="text-sm font-medium text-muted-foreground w-48 flex-shrink-0">
              {field.label}
            </span>
            <span
              className={`text-sm break-all ${field.mono ? "font-mono text-xs bg-muted px-2 py-1 rounded" : ""}`}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
