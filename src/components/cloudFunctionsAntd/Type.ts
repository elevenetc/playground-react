export class Type {
    name: string;
    nullable: boolean;

    constructor(name: string, nullable: boolean = false) {
        this.name = name;
        this.nullable = nullable;
    }

    toString(): string {
        return this.nullable ? `${this.name}?` : this.name;
    }
}
