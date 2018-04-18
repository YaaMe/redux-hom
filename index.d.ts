import {AnyAction, Middleware, Dispatch} from 'redux';

export type Match = (action: AnyAction, id: string) => any;

export type FilterMiddlewaer = (action: AnyAction, service: Service) => Middleware | null | undefined;

export interface Service {
    id: string;
    middleware: Middleware;
    match?: Match;
    [extraProps: string]: any;
}

export interface Options {
    services: ReadonlyArray<Service>;
    filter?: FilterMiddlewaer;
    [extraProps: string]: any;
}

export type HigherOrderMiddleware = (options: Options) => Middleware;

export const higherOrderMiddleware: HigherOrderMiddleware;
export const filterMiddleware: FilterMiddlewaer;
export const services: { [extraProps: string]: Service };
