import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Shield, Download, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certifyImage, type ProvenanceMetadata } from "@/lib/crypto";
import { MetadataViewer } from "@/components/MetadataViewer";

export default function CertifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [certifying, setCertifying] = useState(false);
  const [certifiedBlob, setCertifiedBlob] = useState<Blob | null>(null);
  const [metadata, setMetadata] = useState<ProvenanceMetadata | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setCertifiedBlob(null);
      setMetadata(null);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setCertifiedBlob(null);
      setMetadata(null);
    }
  }, []);

  const handleCertify = async () => {
    if (!file) return;
    setCertifying(true);
    try {
      const result = await certifyImage(file);
      setCertifiedBlob(result.certifiedBlob);
      setMetadata(result.metadata);
    } catch (err) {
      console.error("Certification failed:", err);
    } finally {
      setCertifying(false);
    }
  };

  const handleDownload = () => {
    if (!certifiedBlob || !file) return;
    const url = URL.createObjectURL(certifiedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certified-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold tracking-tight">Certify Image</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Upload an image to generate cryptographic provenance credentials.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            preview ? "border-accent/50 bg-accent/5" : "border-border hover:border-accent/40 hover:bg-muted/50"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {preview ? (
            <div className="space-y-6">
              <img
                src={preview}
                alt="Preview"
                className="max-h-80 mx-auto rounded-md shadow-lg"
              />
              <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div>
                <p className="text-lg font-medium">Drop image here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPEG, PNG, WebP
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <AnimatePresence>
          {file && !certifiedBlob && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 flex justify-center"
            >
              <Button
                size="lg"
                onClick={handleCertify}
                disabled={certifying}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8"
              >
                {certifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Certifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Certify Image
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {certifiedBlob && metadata && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-6"
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                <div>
                  <p className="font-semibold text-success">Image Certified Successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Cryptographic credentials have been embedded into the image file.
                  </p>
                </div>
              </div>

              <MetadataViewer metadata={metadata} />

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="gap-2 bg-primary text-primary-foreground px-8"
                >
                  <Download className="h-4 w-4" />
                  Download Certified Image
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
