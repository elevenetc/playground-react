import {
    FunctionConnectionDto,
    FunctionDto,
    ProjectDto
} from "@/components/cloudFunctionsAntd/api/CloudKotlinFunctionsApi";


export class LocalDb {
    private readonly FUNCTIONS_KEY = 'cloudFunctions';
    private readonly PROJECTS_KEY = 'cloudProjects';
    private readonly CONNECTIONS_KEY = 'functionConnections';

    storeFunction(fun: FunctionDto) {
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
        const data = localStorage.getItem(this.FUNCTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    deleteFunction(functionId: string) {
        const functions = this.getFunctions();
        const filtered = functions.filter(f => f.id !== functionId);
        localStorage.setItem(this.FUNCTIONS_KEY, JSON.stringify(filtered));
    }

    storeProject(project: ProjectDto) {
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
        const data = localStorage.getItem(this.PROJECTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    connectFunctions(outFunctionId: string, inputArgumentId: string) {
        const connections = this.getConnections();
        connections.push({outFunctionId, inputArgumentId});
        localStorage.setItem(this.CONNECTIONS_KEY, JSON.stringify(connections));
    }

    getConnections(): FunctionConnectionDto[] {
        const data = localStorage.getItem(this.CONNECTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    deleteConnection(outFunctionId: string, inputArgumentId: string) {
        const connections = this.getConnections();
        const filtered = connections.filter(
            c => !(c.outFunctionId === outFunctionId && c.inputArgumentId === inputArgumentId)
        );
        localStorage.setItem(this.CONNECTIONS_KEY, JSON.stringify(filtered));
    }

    clear() {
        localStorage.removeItem(this.FUNCTIONS_KEY);
        localStorage.removeItem(this.PROJECTS_KEY);
        localStorage.removeItem(this.CONNECTIONS_KEY);
    }
}
