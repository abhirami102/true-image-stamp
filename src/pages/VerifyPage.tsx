import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Search, ShieldCheck, ShieldAlert, ShieldX, ShieldOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyImage, type VerificationResult } from "@/lib/crypto";
import { MetadataViewer } from "@/components/MetadataViewer";

const statusConfig = {
  authentic: {
    icon: ShieldCheck,
    label: "Certified Authentic Image",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  modified: {
    icon: ShieldAlert,
    label: "Image Modified After Certification",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
  },
  forged: {
    icon: ShieldX,
    label: "Fabricated Signature Detected",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
  },
  uncertified: {
    icon: ShieldOff,
    label: "No Authenticity Credential",
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
  },
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  }, []);

  const handleVerify = async () => {
    if (!file) return;
    setVerifying(true);
    try {
      const res = await verifyImage(file);
      setResult(res);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const config = result ? statusConfig[result.status] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold tracking-tight">Verify Image</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Upload any image to check for embedded provenance credentials.
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
                  Upload any image to check its authenticity
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Verify Button */}
        <AnimatePresence>
          {file && !result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 flex justify-center"
            >
              <Button
                size="lg"
                onClick={handleVerify}
                disabled={verifying}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Verify Image
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-6"
            >
              <div className={`flex items-start gap-3 p-5 rounded-lg border ${config.bg}`}>
                <config.icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${config.color}`} />
                <div>
                  <p className={`font-semibold text-lg ${config.color}`}>{config.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                </div>
              </div>

              {result.metadata && <MetadataViewer metadata={result.metadata} />}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                >
                  Verify Another Image
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
