import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";

export class LocalDb {
    private readonly NAMESPACES_KEY = 'cloudNamespaces';
    private readonly INITIALIZED_KEY = 'cloudFunctionsInitialized';

    storeNamespace(namespace: NamespaceDto) {
        if (!this.hasLocalStorage()) return;

        const namespaces = this.getNamespaces();
        const index = namespaces.findIndex(n => n.id === namespace.id);
        if (index >= 0) {
            namespaces[index] = namespace;
        } else {
            namespaces.push(namespace);
        }
        localStorage.setItem(this.NAMESPACES_KEY, JSON.stringify(namespaces));
    }

    getNamespaces(): NamespaceDto[] {
        if (!this.hasLocalStorage()) return [];

        const data = localStorage.getItem(this.NAMESPACES_KEY);
        return data ? JSON.parse(data) : [];
    }

    clear() {
        if (!this.hasLocalStorage()) return;

        localStorage.removeItem(this.NAMESPACES_KEY);
        localStorage.removeItem(this.INITIALIZED_KEY);
    }

    isInitialized(): boolean {
        if (!this.hasLocalStorage()) return false;

        return localStorage.getItem(this.INITIALIZED_KEY) === 'true';
    }

    markAsInitialized(): void {
        if (!this.hasLocalStorage()) return;

        localStorage.setItem(this.INITIALIZED_KEY, 'true');
    }

    /**
     * Checks if localStorage is available.
     * Returns false during server-side rendering (SSR) or in environments where localStorage is not defined.
     */
    private hasLocalStorage(): boolean {
        return typeof localStorage !== 'undefined';
    }
}
