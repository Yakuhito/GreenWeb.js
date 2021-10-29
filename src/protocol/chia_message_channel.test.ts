import { ChiaMessageChannel } from "./chia_message_channel";
import { assert } from 'chai';

const testServer: string = "chianode.test";

it("works", async () => {
    const channel = new ChiaMessageChannel({
        host: testServer,
        port: 8449,
        onMessage: (msg) => console.log(msg.toString('hex'))
    });
    await channel.connect();
    await new Promise(r => setTimeout(r, 10000));
});