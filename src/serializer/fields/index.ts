import { BooleanField } from './boolean';
import { VariableSizeBytesField } from './variable_size_bytes'
import { BytesField } from './bytes';
import { ListField } from './list';
import { OptionalField } from './optional';
import { StringField } from './string';
import { TupleField } from './tuple';
import { UintField } from './uint';

export default {
    Boolean: BooleanField,
    Bytes: BytesField,
    List: ListField,
    Optional: OptionalField,
    String: StringField,
    Tuple: TupleField,
    Uint: UintField,
    VariableSizeBytes: VariableSizeBytesField
};