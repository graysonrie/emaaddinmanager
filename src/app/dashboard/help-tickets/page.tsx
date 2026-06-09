import PageWrapper from "@/components/PageWrapper";
import HelpTicketsPreview from "./HelpTicketsPreview";

export default function HelpTicketsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col h-full">
        <div className="flex flex-col thin-scrollbar overflow-y-auto px-6 py-8">
          <div className="max-w-4xl w-full mx-auto">
            <h1 className="text-2xl font-bold mb-4">Help Tickets</h1>
            <p className="text-muted-foreground mb-4">
              View and manage your help tickets.
            </p>
            <HelpTicketsPreview />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
