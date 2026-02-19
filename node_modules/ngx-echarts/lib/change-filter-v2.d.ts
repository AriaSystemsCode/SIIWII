import { SimpleChanges } from '@angular/core';
export declare class ChangeFilterV2 {
    private subject;
    private subscriptions;
    doFilter(changes: SimpleChanges): void;
    dispose(): void;
    notEmpty<T>(key: string, handler: (t: T) => void): void;
    has<T>(key: string, handler: (t: T) => void): void;
    notFirst<T>(key: string, handler: (t: T) => void): void;
    notFirstAndEmpty<T>(key: string, handler: (t: T) => void): void;
}
