import { BooleanField } from './boolean';
import { BytesField } from './bytes';
import { ListField } from './list';
import { ObjectField } from './object';
import { OptionalField } from './optional';
import { StringField } from './string';
import { TupleField } from './tuple';
import { UintField } from './uint';
import { SExpField } from './sexp';

export default {
    Boolean: BooleanField,
    Bytes: BytesField,
    List: ListField,
    Object: ObjectField,
    Optional: OptionalField,
    String: StringField,
    Tuple: TupleField,
    Uint: UintField,
    SExp: SExpField,
};