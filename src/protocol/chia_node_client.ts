import { uint, bytes } from "src/serializer/basic_types";
import { Queue } from "../types/queue";
import { make_msg, NodeType } from "../types/outbound_message";
import { ProtocolMessageTypes } from "../types/protocol_message_types";
import { Capability, Handshake, protocol_version } from "../types/shared_protocol";
import { getSoftwareVersion } from "../util/software_version";

export class ChiaNodeClient {
    full_node_port: uint;
    wallet_port: uint;
    full_node_url: string;
    wallet_url: string;
    wallet_ws: WebSocket;
    wallet_incoming_messages: Queue<bytes> = new Queue<bytes>();

    constructor(host: string, full_node_port: number = 8444, wallet_port: number =  8449) {
    }

    async _read_wallet_message() {
        while(true) {
            const val = this.wallet_incoming_messages.pop();
            if(val !== undefined) {
                return val;
            }
            await new Promise(r => setTimeout(r, 250));
        }
    }

    async initialize_wallet() {
        const handshake: Handshake = new Handshake();
        handshake.network_id = "mainnet";
        handshake.protocol_version = protocol_version;
        handshake.software_version = getSoftwareVersion();
        handshake.server_port = this.wallet_port;
        handshake.node_type = NodeType.WALLET;
        handshake.capabilities = [[Capability.BASE, "1"], ];
        const hanshake_msg: bytes = make_msg(
            ProtocolMessageTypes.handshake,
            handshake
        );

        new WebSocket(this.full_node_url, {
            rejectUnauthorized: false
        });

        await new Promise<void>((resolve, reject) => {
            const timer = setInterval(() => {
                if(this.wallet_ws.readyState === 1) {
                    clearInterval(timer)
                    resolve();
                }
            }, 100);
        });
    }

    async initialize() {
        return Promise.all([
            this.initialize_wallet()
        ]);
        // todo: full node
    }
}