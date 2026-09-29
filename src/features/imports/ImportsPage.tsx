import { Watch, ShieldCheck, RotateCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export function ImportsPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Importaciones</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">ChooseSwim Sync iOS</h1>
        <p className="mt-2 max-w-2xl text-sm text-app-muted">La PWA sigue siendo el producto principal. La mini app iOS solo sincroniza entrenos de Apple Health/Apple Watch con Firebase.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><Watch size={20} /><strong>Apple Watch</strong></div>
          <p className="mt-3 text-sm text-app-muted">El Watch registra natación, Apple Health guarda el entreno y ChooseSwim Sync lo sube como sesión `apple_health`.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><RotateCw size={20} /><strong>Procesado backend</strong></div>
          <p className="mt-3 text-sm text-app-muted">Cada importación entra con `processingStatus: pending`; las Cloud Functions calculan XP, stats, rango y narrativa.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><ShieldCheck size={20} /><strong>Sin duplicados</strong></div>
          <p className="mt-3 text-sm text-app-muted">La app iOS usa `healthKitWorkoutUUID` y un documento determinista para no importar dos veces el mismo entreno.</p>
        </Card>
      </section>
      <Card>
        <div className="flex flex-wrap gap-2"><Badge>Estado: scaffold iOS creado</Badge><Badge>HealthKit</Badge><Badge>Firebase Auth</Badge><Badge>Firestore</Badge></div>
        <p className="mt-4 text-sm leading-6 text-app-muted">Para usarlo, abre `ios-sync/ChooseSwimSync` en Xcode, añade `GoogleService-Info.plist`, activa HealthKit y ejecuta en iPhone físico. Las sesiones importadas aparecen en historial con badge Apple Watch y los datos crudos quedan bloqueados en edición.</p>
      </Card>
    </div>
  );
}
