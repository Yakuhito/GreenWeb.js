import { BooleanField } from './boolean';
import { BytesField } from './bytes'
import { ListField } from './list';
import { OptionalField } from './optional';
import { StringField } from './string';
import { TupleField } from './tuple';
import { Uint32Field } from './uint32';

export default {
    Boolean: BooleanField,
    Bytes: BytesField,
    List: ListField,
    Optional: OptionalField,
    String: StringField,
    Tuple: TupleField,
    Uint32: Uint32Field
};