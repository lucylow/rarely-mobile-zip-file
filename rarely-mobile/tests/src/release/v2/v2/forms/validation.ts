export interface FieldError { field: string; code: string; message: string; }
export function required(value: string, field: string, message = 'This is required.'): FieldError | undefined { return value.trim() ? undefined : { field, code: 'required', message }; }
export function maxLength(value: string, max: number, field: string): FieldError | undefined { return value.length <= max ? undefined : { field, code: 'max-length', message: `Keep this under ${max} characters.` }; }
export function collectErrors(...errors: Array<FieldError | undefined>): FieldError[] { return errors.filter((error): error is FieldError => !!error); }
