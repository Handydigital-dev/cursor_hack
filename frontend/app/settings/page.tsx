import { SettingsForm } from '../components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <SettingsForm />
    </div>
  );
}
