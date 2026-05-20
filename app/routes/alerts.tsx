// Do we even have endpoint for this? 

export default function AlertsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="font-serif font-medium text-3xl text-mf-ink mb-6">Alerts</h1>
      <div className="bg-mf-card border border-mf-line rounded-mf-lg p-6 shadow-sm">
        <p className="text-mf-ink-2">You have no new alerts right now.</p>
      </div>
    </div>
  );
}
