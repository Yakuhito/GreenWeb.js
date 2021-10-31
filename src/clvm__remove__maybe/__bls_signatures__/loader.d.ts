import type {ModuleInstance} from "@chiamine/bls-signatures";
type TCreateModule = () => Promise<ModuleInstance>;
export default TCreateModule;
