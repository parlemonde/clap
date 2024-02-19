import { isNumber } from './is-number';
import { isObjectLiteral } from './is-object-literal';
import type { Student } from 'types/models/student.type';

export function isStudent(value: unknown): value is Student {
    return (
        isObjectLiteral(value) &&
        // projectId: number
        isNumber(value.projectId) &&
        // sequencyId: number
        isNumber(value.sequencyId) &&
        // teacherId: number
        isNumber(value.teacherId)
    );
}
