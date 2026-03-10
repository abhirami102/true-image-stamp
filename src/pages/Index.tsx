import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, ArrowRight, Lock, Fingerprint, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Fingerprint,
    title: "SHA-256 Hashing",
    description: "Every pixel contributes to a unique cryptographic fingerprint.",
  },
  {
    icon: Lock,
    title: "RSA Digital Signatures",
    description: "Non-forgeable signatures prove image origin and integrity.",
  },
  {
    icon: FileCheck,
    title: "Embedded Provenance",
    description: "Credentials travel with the image, not in external databases.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden section-grid">
        <div className="container max-w-5xl py-24 md:py-32 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm font-medium">
              <Shield className="h-4 w-4 text-accent" />
              Cryptographic Image Provenance
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Prove your images
              <br />
              <span className="text-accent">are real</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Certify photographs with non-forgeable cryptographic signatures. 
              Detect tampering. Verify authenticity. No AI fakes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <Link to="/certify">
                  <Shield className="h-4 w-4" />
                  Certify an Image
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                <Link to="/verify">
                  <Search className="h-4 w-4" />
                  Verify an Image
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="container max-w-5xl px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-lg border bg-card"
              >
                <feature.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t bg-muted/30">
        <div className="container max-w-3xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">How it works</h2>
          <div className="space-y-6 text-left">
            {[
              { step: "01", text: "Upload your original photograph" },
              { step: "02", text: "SHA-256 hash is computed from pixel data" },
              { step: "03", text: "Hash is signed with RSA-2048 private key" },
              { step: "04", text: "Provenance metadata is embedded in the file" },
              { step: "05", text: "Download the certified image" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-6 p-4 rounded-lg border bg-card">
                <span className="font-mono text-2xl font-bold text-accent w-12">{item.step}</span>
                <span className="text-base">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Button asChild className="gap-2 bg-primary text-primary-foreground">
              <Link to="/certify">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
