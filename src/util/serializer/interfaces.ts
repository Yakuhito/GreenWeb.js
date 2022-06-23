/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPropsType {
    [prop: string]: FieldSerializer;
}
export interface ObjectWithProps {
    [prop: string]: any;
    __serializer__?: IPropsType;
}

export interface FieldSerializer<T = any> {
    serialize: (value: T, buf: Buffer) => Buffer;
    deserialize: (sr: Buffer) => [T, Buffer];
}

export interface ObjectWithSerializer<T = any> {
    __serializer__?: FieldSerializer<T>;
}

export type FieldRegistered = (target: ObjectWithProps, property: string | symbol) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldDecorator = (...args: any[]) => FieldRegistered;