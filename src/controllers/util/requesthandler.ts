import express from "express";
import {Checker} from "./checker";

interface Field {
    name: string
    checker: Checker
    type: 'query' | 'params'
}

export class RequestHandler {
    public parseQuery<QueryClass>(req: express.Request, fields: Field[]): QueryClass {
        let query = {params: {}, query: {}} as QueryClass
        for (let field of fields) {
            if (field.type === 'query') {
                (query as any)[field.type][field.name] = field.checker.check(field.name, (req.query as any)[field.name])
            } else if (field.type === 'params') {
                (query as any)[field.type][field.name] = field.checker.check(field.name, (req.params as any)[field.name])
            }

        }
        return query
    }
}