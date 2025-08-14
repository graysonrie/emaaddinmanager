"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageWrapper from "@/components/PageWrapper";
import DevVsTemplates from "./vs-templates";

export default function ResourcesPage() {
  return (
    <PageWrapper>
      <div className="h-full flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b pb-6 p-2 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold">Development Resources</h1>
          <p className="text-muted-foreground mt-2">
            Access tools, templates, and resources to enhance your add-in
            development workflow
          </p>
        </div>

        {/* Navigation Tabs - Fixed */}
        <div className="flex-shrink-0 p-2 max-w-4xl mx-auto w-full">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              <TabsTrigger value="templates">VS Templates</TabsTrigger>
              <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
              <TabsTrigger value="tools">Dev Tools</TabsTrigger>
            </TabsList>

            {/* Scrollable Content Area */}
            <div className="mt-6 thin-scrollbar overflow-y-auto flex-1 min-h-0 max-h-[calc(100vh-200px)]">
              <TabsContent value="templates" className="mt-0">
                <DevVsTemplates />
              </TabsContent>

              <TabsContent value="snippets" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Code Snippets</p>
                    <p className="text-sm mt-2">
                      Coming soon - reusable code snippets for common tasks
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Development Tools</p>
                    <p className="text-sm mt-2">
                      Coming soon - utilities and tools for developers
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* <TabsContent value="docs" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Documentation</p>
                    <p className="text-sm mt-2">
                      Coming soon - guides and reference materials
                    </p>
                  </div>
                </div>
              </TabsContent> */}
            </div>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}
