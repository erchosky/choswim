import { Download } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';

export function InstallPromptButton() {
  const { installPrompt, setInstallPrompt } = useAppStore();
  if (!installPrompt) return null;

  return (
    <Button
      variant="secondary"
      className="w-full"
      icon={<Download size={18} />}
      onClick={async () => {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome !== 'dismissed') setInstallPrompt(null);
      }}
    >
      Instalar PWA
    </Button>
  );
}
