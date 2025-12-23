"use client";
import { useState } from "react";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyMail = async () => {
    const email = "sl.code.777@gmail.com";
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AdaTools. All rights reserved.
          </div>

          <div
            className="flex gap-6 text-sm text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer "
            onClick={handleCopyMail}
          >
            {copied === true ? "Email copié !" : "Contact"}
          </div>
        </div>
      </div>
    </footer>
  );
}
