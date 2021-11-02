import { ChiaMessageChannel } from "./chia_node/chia_message_channel";
import { Message, make_msg } from "../types/outbound_message";
import { Serializer } from "../serializer";
import { ProtocolMessageTypes } from "../types/protocol_message_types";
import { RegisterForPhUpdates, RequestBlockHeader, RespondToPhUpdates } from "../types/wallet_protocol";
import { Handshake } from "../types/shared_protocol";

it('aaa', async () => {
    var msgCh: ChiaMessageChannel = new ChiaMessageChannel({
        host: 'chianode.test',
        port: 8444,
        onMessage: (raw_msg) => {
            const msg: Message = Serializer.deserialize(Message, raw_msg);
            if(msg.type === ProtocolMessageTypes.new_peak_wallet) return;
            if(msg.type === ProtocolMessageTypes.handshake) {
                console.log(Serializer.deserialize(Handshake, msg.data));

                return;
            }
            if(msg.type === ProtocolMessageTypes.respond_to_ph_update) {
                const resp = Serializer.deserialize(RespondToPhUpdates, msg.data);
                //console.log(resp);
                console.log(resp.coin_states.length);
                console.log(resp.coin_states[0].coin.amount);

                return;
            }
            console.log(msg);
        }
    });
    await msgCh.connect();
    await new Promise( resolve => setTimeout(resolve, 5000));

    /*const pckt: RequestBlockHeader = new RequestBlockHeader();
    pckt.height = 1000000;

    const msg: Buffer = make_msg(
        ProtocolMessageTypes.request_block_header,
        pckt
    );*/

    const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
    pckt.min_height = 0;
    pckt.puzzle_hashes = [
        Buffer.from("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664", "hex")
    ];

    const msg: Buffer = make_msg(
        ProtocolMessageTypes.register_interest_in_puzzle_hash,
        pckt
    );

    await msgCh.sendMessage(msg);

    await new Promise( resolve => setTimeout(resolve, 600000));
});