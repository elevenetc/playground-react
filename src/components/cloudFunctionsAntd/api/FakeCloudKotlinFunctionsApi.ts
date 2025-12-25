import {
    CloudKotlinFunctionsApi,
    ErrorDto,
    FunctionConnectionDto,
    FunctionDto,
    ProjectDto,
    TypeDto
} from './CloudKotlinFunctionsApi';
import {LocalDb} from '../db/LocalDb';
import {FakeFunctionRunner} from '../FakeFunctionRunner';
import {Project} from '../Project';
import {Function, FunctionState} from '../Function';
import {FunctionConnection} from '../FunctionConnection';
import {parseKotlinFunction} from './parseKotlinFunction';

export class FakeCloudKotlinFunctionsApi implements CloudKotlinFunctionsApi {
    private localDb: LocalDb;
    private project: Project;
    private runner: FakeFunctionRunner;
    private eventSubscribers: Array<(eventId: string, functionDto: FunctionDto, error: ErrorDto | null) => void>;

    constructor(initializeDemoData: boolean = true) {
        this.localDb = new LocalDb();
        this.project = new Project();
        this.runner = new FakeFunctionRunner(this.project);
        this.eventSubscribers = [];

        if (initializeDemoData) {
            this.initializeDemoDataIfNeeded();
        }
        this.loadProjectFromDb();
        this.setupRunnerSubscription();
    }

    getProjects(): ProjectDto[] {
        const allFunctions = Array.from(this.project.getAllFunctions().values());
        const allConnections = this.project.getAllConnections();

        const projectDto: ProjectDto = {
            name: 'default',
            functions: allFunctions.map(f => this.functionToDto(f)),
            connections: allConnections.map(c => this.connectionToDto(c))
        };

        return [projectDto];
    }

    runFunction(functionId: string): void {
        try {
            this.runner.run(functionId);
        } catch (error) {
            const func = this.project.getFunction(functionId);
            if (func) {
                const errorDto: ErrorDto = {
                    id: crypto.randomUUID(),
                    message: error instanceof Error ? error.message : 'Unknown error'
                };

                this.eventSubscribers.forEach(callback => {
                    callback(crypto.randomUUID(), this.functionToDto(func), errorDto);
                });
            }
        }
    }

    createFunction(sourceCode: string): void {
        const functionDto = parseKotlinFunction(sourceCode);
        const func = this.dtoToFunction(functionDto);

        this.project.addFunction(func);
        this.saveProject();

        this.eventSubscribers.forEach(callback => {
            callback(crypto.randomUUID(), functionDto, null);
        });
    }

    deleteFunction(functionId: string): void {
        this.project.removeFunction(functionId);
        this.localDb.deleteFunction(functionId);
        this.saveProject();
    }

    connectionFunctions(outputFunctionId: string, inputFunctionArgumentId: string): void {
        this.project.addConnection(outputFunctionId, inputFunctionArgumentId);
        this.saveProject();
    }

    subscribeToFunctionEvents(
        callback: (eventId: string, functionDto: FunctionDto, error: ErrorDto | null) => void
    ): void {
        this.eventSubscribers.push(callback);
    }

    private initializeDemoDataIfNeeded(): void {
        if (this.localDb.isInitialized()) {
            return;
        }

        const func1 = 'fun start(): String { return "foo" }';
        const func2 = 'fun validateData(data: String, dataStr: String, dataInt: Int): Boolean { return data.isNotEmpty() }';
        const func3 = 'fun transformData(validationResult: Boolean): List<Int> { return listOf(1, 2, 3) }';

        this.createFunction(func1);
        this.createFunction(func2);
        this.createFunction(func3);

        const allProjects = this.getProjects();
        if (allProjects.length > 0 && allProjects[0].functions.length >= 3) {
            const functions = allProjects[0].functions;
            this.connectionFunctions(functions[0].id, functions[1].id);
            this.connectionFunctions(functions[1].id, functions[2].id);
        }

        this.localDb.markAsInitialized();
    }

    private loadProjectFromDb(): void {
        const projects = this.localDb.getProjects();
        if (projects.length > 0) {
            const projectDto = projects[0];

            projectDto.functions.forEach(funcDto => {
                const func = this.dtoToFunction(funcDto);
                this.project.addFunction(func);
            });

            projectDto.connections.forEach(connDto => {
                this.project.addConnection(connDto.outFunctionId, connDto.inputArgumentId);
            });
        }
    }

    private setupRunnerSubscription(): void {
        this.runner.subscribeOnFunctionStateChange(event => {
            const func = this.project.getFunction(event.functionId);
            if (func) {
                func.state = event.newState;
                const functionDto = this.functionToDto(func);

                this.localDb.storeFunction(functionDto);

                this.eventSubscribers.forEach(callback => {
                    callback(crypto.randomUUID(), functionDto, null);
                });
            }
        });
    }

    private saveProject(): void {
        const projectDto = this.getProjects()[0];
        this.localDb.storeProject(projectDto);
    }

    private functionToDto(func: Function): FunctionDto {
        const args = Array.from(func.arguments.entries());

        return {
            id: func.id,
            name: func.name,
            returnType: this.typeToDto(func.returnType),
            arguments: args.map(([name, type], index) => ({
                id: `${func.id}-arg-${index}`,
                name,
                type: this.typeToDto(type),
                nullable: type.endsWith('?'),
                defaultValue: ''
            })),
            sourceCode: func.sourceCode,
            state: func.state
        };
    }

    private dtoToFunction(dto: FunctionDto): Function {
        const args: [string, string][] = dto.arguments.map(arg => [
            arg.name,
            arg.type.name + (arg.nullable ? '?' : '')
        ]);

        const returnType = dto.returnType.name + (dto.returnType.nullable ? '?' : '');

        return new Function(
            dto.id,
            dto.name,
            args,
            returnType,
            dto.sourceCode,
            dto.state as FunctionState
        );
    }

    private typeToDto(typeString: string): TypeDto {
        const nullable = typeString.endsWith('?');
        const name = nullable ? typeString.slice(0, -1) : typeString;

        return {
            name,
            nullable
        };
    }

    private connectionToDto(conn: FunctionConnection): FunctionConnectionDto {
        return {
            outFunctionId: conn.outFunctionId,
            inputArgumentId: conn.inputArgumentId
        };
    }
}
