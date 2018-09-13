import {AnyAction, Middleware, Dispatch} from 'redux';

export type Match = (action: AnyAction, id: string) => any;

export type MiddlewareFilter = (action: AnyAction, service: Service) => Middleware | null | undefined;

export interface Service {
    id: string;
    middleware: Middleware;
    match?: Match;
    [extraProps: string]: any;
}

export interface Options {
    services: ReadonlyArray<Service>;
    filter?: MiddlewareFilter;
    [extraProps: string]: any;
}

export type HigherOrderMiddleware = (options: Options) => Middleware;

export const higherOrderMiddleware: HigherOrderMiddleware;
export const middlewareFilter: MiddlewareFilter;
export const services: { [extraProps: string]: Service };
