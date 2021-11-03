import { ChiaNodeProvider } from "./chia_node";
import { Provider } from "./provider";
import { assert } from "chai";

const nodeHost: string = "chianode.test";

it('Test provider - ' + nodeHost, async () => {
    const p: Provider = new ChiaNodeProvider(nodeHost);
    await p.initialize();

    const blockNumber = await p.getBlockNumber();
    assert.isTrue(blockNumber != null && blockNumber > 1000000);
    console.log("Block number: " + blockNumber!.toString());

    await p.close();
});

/*it('aaa', async () => {
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
                console.log(resp);
                console.log(resp.coin_states.length);
                console.log(resp.coin_states[0].coin.amount);

                return;
            }
            console.log(msg);
        }
    });
    await msgCh.connect();
    await new Promise( resolve => setTimeout(resolve, 5000));

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
});*/