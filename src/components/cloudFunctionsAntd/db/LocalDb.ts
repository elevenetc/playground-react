import {
    FunctionConnectionDto,
    FunctionDto,
    ProjectDto
} from "@/components/cloudFunctionsAntd/api/CloudKotlinFunctionsApi";


export class LocalDb {
    private readonly FUNCTIONS_KEY = 'cloudFunctions';
    private readonly PROJECTS_KEY = 'cloudProjects';
    private readonly CONNECTIONS_KEY = 'functionConnections';
    private readonly INITIALIZED_KEY = 'cloudFunctionsInitialized';

    storeFunction(fun: FunctionDto) {
        if (!this.hasLocalStorage()) return;

        const functions = this.getFunctions();
        const index = functions.findIndex(f => f.id === fun.id);
        if (index >= 0) {
            functions[index] = fun; // Update existing
        } else {
            functions.push(fun); // Add new
        }
        localStorage.setItem(this.FUNCTIONS_KEY, JSON.stringify(functions));
    }

    getFunctions(): FunctionDto[] {
        if (!this.hasLocalStorage()) return [];

        const data = localStorage.getItem(this.FUNCTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    deleteFunction(functionId: string) {
        if (!this.hasLocalStorage()) return;

        const functions = this.getFunctions();
        const filtered = functions.filter(f => f.id !== functionId);
        localStorage.setItem(this.FUNCTIONS_KEY, JSON.stringify(filtered));
    }

    storeProject(project: ProjectDto) {
        if (!this.hasLocalStorage()) return;

        const projects = this.getProjects();
        const index = projects.findIndex(p => p.name === project.name);
        if (index >= 0) {
            projects[index] = project; // Update existing
        } else {
            projects.push(project); // Add new
        }
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    }

    getProjects(): ProjectDto[] {
        if (!this.hasLocalStorage()) return [];

        const data = localStorage.getItem(this.PROJECTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    connectFunctions(outFunctionId: string, inputArgumentId: string) {
        if (!this.hasLocalStorage()) return;

        const connections = this.getConnections();
        connections.push({outFunctionId, inputArgumentId});
        localStorage.setItem(this.CONNECTIONS_KEY, JSON.stringify(connections));
    }

    getConnections(): FunctionConnectionDto[] {
        if (!this.hasLocalStorage()) return [];

        const data = localStorage.getItem(this.CONNECTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    deleteConnection(outFunctionId: string, inputArgumentId: string) {
        if (!this.hasLocalStorage()) return;

        const connections = this.getConnections();
        const filtered = connections.filter(
            c => !(c.outFunctionId === outFunctionId && c.inputArgumentId === inputArgumentId)
        );
        localStorage.setItem(this.CONNECTIONS_KEY, JSON.stringify(filtered));
    }

    clear() {
        if (!this.hasLocalStorage()) return;

        localStorage.removeItem(this.FUNCTIONS_KEY);
        localStorage.removeItem(this.PROJECTS_KEY);
        localStorage.removeItem(this.CONNECTIONS_KEY);
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
