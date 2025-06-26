import { useLibraryStore } from "./store";

export default function AddinPreview() {
  const { selectedAddin } = useLibraryStore();
  return (
    <div className="flex flex-1 bg-card border-l p-6 min-w-[300px] max-w-xl shadow-sm h-full overflow-auto font-sans">
      {selectedAddin ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">{selectedAddin.name}</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Version:</span>{" "}
              {selectedAddin.version}
            </div>
            <div>
              <span className="font-medium">Vendor:</span>{" "}
              {selectedAddin.vendor}
            </div>
            {selectedAddin.email && (
              <div>
              <span className="font-medium">Owner:</span> {selectedAddin.email}
            </div>
            )}
            <div>
              <span className="font-medium">Type:</span>{" "}
              {selectedAddin.addinType}
            </div>
            <div>
              <span className="font-medium">Description:</span>{" "}
              {selectedAddin.vendorDescription}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <span className="text-lg mb-2">No addin selected</span>
          <span className="text-sm">
            Select an addin from the list to see its details.
          </span>
        </div>
      )}
    </div>
  );
}
