type Identifier<T> = string & keyof T

type CastMap = {
    string: string,
    boolean: boolean,
    number: number,
}

export class URLParams {
    private static search = new URLSearchParams(window.location.search);

    static get<CastTo extends Identifier<CastMap>>(param: string, castTo: CastTo): CastMap[CastTo] | null {
        const paramValue = URLParams.search.get(param);
        if (paramValue === null) {
            return null;
        }

        switch (castTo) {
            case "string":
                return paramValue.length === 0 ? null : paramValue as CastMap[CastTo];
            case "boolean":
                return ['', '1', 'true'].includes(paramValue) as CastMap[CastTo];
            case "number":
                return Number.isNaN(paramValue) || paramValue.length === 0 ? null : Number.parseInt(paramValue) as CastMap[CastTo];
        }

        return null;
    }
}