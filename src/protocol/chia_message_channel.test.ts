import { ChiaMessageChannel } from "./chia_message_channel";
import { Message } from "../types/outbound_message";
import { Serializer } from "../serializer";
import { Handshake } from "../types/shared_protocol";
import { NewPeakWallet } from "../types/wallet_protocol";

const testServer: string = "chianode.test";

it("works", async () => {
    const channel = new ChiaMessageChannel({
        host: testServer,
        port: 8444,
        onMessage: (buf) => {
            console.log("Incoming message: " + buf.toString('hex'));
            const msg: Message = Serializer.deserialize(Message, buf);
            console.log("Message type: " + msg.type.toString());
            if(msg.type == 1) {
                const h: Handshake = Serializer.deserialize(Handshake, msg.data);
                console.log(h);
            } else if(msg.type == 50) {
                const newPeak: NewPeakWallet = Serializer.deserialize(NewPeakWallet, msg.data);
                console.log(newPeak);
            }
        },
    });
    await channel.connect();
    await new Promise(r => setTimeout(r, 300000));
});