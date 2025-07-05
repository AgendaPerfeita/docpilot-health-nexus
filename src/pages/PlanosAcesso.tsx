import { PlanoMedicoSelector } from "@/components/PlanoMedicoSelector";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function PlanosAcesso() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PermissionGuard requiresPremium={false}>
        <PlanoMedicoSelector />
      </PermissionGuard>
    </div>
  );
}