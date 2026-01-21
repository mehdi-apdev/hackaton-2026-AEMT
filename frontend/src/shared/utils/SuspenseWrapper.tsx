import { lazy, Suspense, type ComponentType, type PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren {
  // Function that dynamically imports a component
    importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
}

export function SuspenseWrapper({ importFn }: Props) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const LazyComponent = useMemo(() => lazy(importFn), []);

    return (
        // Displays a loading text while the component is loading
        <Suspense fallback={<div>Chargement...</div>}>
            <LazyComponent />
        </Suspense>
    );
}