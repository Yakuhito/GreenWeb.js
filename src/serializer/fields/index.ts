import { BooleanField } from './boolean';
import { BytesField } from './bytes'
import { FixedSizeBytesField } from './fixed_size_bytes';
import { ListField } from './list';
import { OptionalField } from './optional';
import { StringField } from './string';
import { TupleField } from './tuple';
import { UintField } from './uint';

export default {
    Boolean: BooleanField,
    Bytes: BytesField,
    FixedSizeBytes: FixedSizeBytesField,
    List: ListField,
    Optional: OptionalField,
    String: StringField,
    Tuple: TupleField,
    Uint: UintField
};