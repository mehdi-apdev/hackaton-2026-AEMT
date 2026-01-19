import { lazy, Suspense, type ComponentType, type PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren {
    // Fonction qui importe dynamiquement un composant
    importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
}

export function SuspenseWrapper({ importFn }: Props) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const LazyComponent = useMemo(() => lazy(importFn), []);

    return (
        // Affiche un texte de chargement pendant que le composant arrive
        <Suspense fallback={<div>Chargement...</div>}>
            <LazyComponent />
        </Suspense>
    );
}