import { lazy, Suspense, type ComponentType } from "react";

interface Props {
    // Fonction qui importe dynamiquement un composant
    importFn: () => Promise<{ default: ComponentType<any> }>;
}

export function SuspenseWrapper({ importFn }: Props) {
    const LazyComponent = lazy(importFn);

    return (
        // Affiche un texte de chargement pendant que le composant arrive
        <Suspense fallback={<div>Chargement...</div>}>
            <LazyComponent />
        </Suspense>
    );
}