import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Key, Palette, Pin, Sparkles } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <div className="">
      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            Ready to boost your workflow?
          </h2>
          <p className="text-muted-foreground mb-6">
            Create a free account to unlock all tools and enjoy the full
            AdaTools experience 💫
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            <Card className=" shadow-primary hover:shadow-md ">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Pin className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-left">
                  Pin your{" "}
                  <span className="text-primary font-semibold">
                    favorite modules{" "}
                  </span>
                  on your dashboard
                </p>
              </CardContent>
            </Card>

            <Card className=" shadow-primary hover:shadow-md ">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-left">
                  Access{" "}
                  <span className="text-primary font-semibold">
                    powerful tools{" "}
                  </span>
                  like the &quot;snippet manager&quot; or the &quot;color
                  palettes&quot;
                </p>
              </CardContent>
            </Card>

            <Card className=" shadow-primary hover:shadow-md ">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-left">
                  Use free API keys to access{" "}
                  <span className="text-primary font-semibold">
                    free background removal{" "}
                  </span>{" "}
                  and{" "}
                  <span className="text-primary font-semibold">
                    free translations{" "}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className=" shadow-primary hover:shadow-md ">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-left">
                  Choose between{" "}
                  <span className="text-primary font-semibold">
                    18 beautiful themes{" "}
                  </span>{" "}
                  for your dashboard
                </p>
              </CardContent>
            </Card>
          </div>

          <Button asChild size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
